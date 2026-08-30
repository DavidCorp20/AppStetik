"""Production entrypoint for Stetik.

Use this module for production deployments instead of ``server:app``.
It keeps the existing MVP routes intact while adding a central security layer.
"""

import os
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

import server

app = server.app


def _parse_iso(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (TypeError, ValueError):
        return None


def _subscription_is_valid(account: dict[str, Any]) -> tuple[bool, str]:
    status = account.get("account_status", "active")
    if status in {"pending", "suspended", "disabled", "inactive"}:
        return False, f"Cuenta no activa ({status})"

    now = datetime.now(timezone.utc)
    subscription_end = _parse_iso(account.get("subscription_ends_at"))
    trial_end = _parse_iso(account.get("trial_ends_at"))

    if subscription_end is not None:
        return (True, "active_subscription") if subscription_end > now else (False, "Suscripción vencida")

    if trial_end is not None:
        return (True, "active_trial") if trial_end > now else (False, "Período de prueba vencido")

    if account.get("role") == "admin":
        return True, "admin"

    # Deliberately opt-in: production should not silently grant access to
    # accounts that have neither a trial nor a paid subscription.
    if os.getenv("STETIK_ALLOW_UNSUBSCRIBED_ACCESS", "false").lower() == "true":
        return True, "legacy_access"

    return False, "Cuenta sin trial o suscripción activa"


async def hardened_current_user(credentials=server.HTTPAuthorizationCredentials):
    """Central authentication + subscription gate for every protected route."""
    # This function is replaced below with the dependency-compatible version.
    raise RuntimeError("Dependency placeholder was not replaced")


async def _hardened_current_user(credentials):
    user = await server.get_current_user(credentials)

    # server.get_current_user already validates JWT, user existence and
    # business-sub-user activity. We only centralize account entitlement here.
    account = user
    if user.get("is_business_user") and user.get("business_id"):
        account = await server.db.users.find_one(
            {"id": user["business_id"]}, {"_id": 0, "password": 0}
        )
        if account is None:
            raise HTTPException(status_code=401, detail="Cuenta de negocio no encontrada")

    allowed, reason = _subscription_is_valid(account)
    if not allowed:
        raise HTTPException(
            status_code=403,
            detail=reason,
            headers={"X-Stetik-Code": "SUBSCRIPTION_REQUIRED"},
        )

    return user


# FastAPI dependency overrides are applied to every route that depends on the
# original get_current_user function, including routes added in the future.
app.dependency_overrides[server.get_current_user] = _hardened_current_user


class ProductionHardeningMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Development/manual payment shortcut: never expose it in production.
        if (
            path.rstrip("/") == "/api/auth/upgrade"
            and os.getenv("STETIK_ALLOW_LEGACY_UPGRADE", "false").lower() != "true"
        ):
            return JSONResponse(
                status_code=410,
                content={
                    "detail": "El upgrade directo está deshabilitado. La activación se realiza mediante el flujo de pago."
                },
            )

        # Never expose development password-reset/debug token routes.
        if (
            "debug_token" in path
            or path.rstrip("/").endswith("/auth/debug")
        ) and os.getenv("STETIK_ALLOW_DEBUG_ENDPOINTS", "false").lower() != "true":
            return JSONResponse(status_code=404, content={"detail": "Not found"})

        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


app.add_middleware(ProductionHardeningMiddleware)

__all__ = ["app"]
