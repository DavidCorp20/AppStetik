"""Production entrypoint for Stetik.

This module wraps the existing FastAPI application without changing the MVP
routes. Use this entrypoint for production deployments instead of server:app.

Hardening included:
- Central subscription/account-status enforcement for authenticated API calls.
- Business sub-user subscription enforcement against the business owner.
- Legacy unauthorised Premium upgrade endpoint disabled by default.
- Debug password-reset token endpoints disabled by default.
- Security response headers.

The original backend remains intact so the MVP can be rolled back easily.
"""

import os
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, Request
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
    """Return whether an account may access authenticated application APIs."""
    status = account.get("account_status", "active")
    if status in {"pending", "suspended", "disabled", "inactive"}:
        return False, f"Cuenta no activa ({status})"

    now = datetime.now(timezone.utc)
    subscription_end = _parse_iso(account.get("subscription_ends_at"))
    trial_end = _parse_iso(account.get("trial_ends_at"))

    # A paid subscription has priority over a trial.
    if subscription_end is not None:
        if subscription_end > now:
            return True, "active_subscription"
        return False, "Suscripción vencida"

    # No paid subscription: allow an active trial.
    if trial_end is not None:
        if trial_end > now:
            return True, "active_trial"
        return False, "Período de prueba vencido"

    # Preserve existing free-account behaviour only when explicitly enabled.
    if os.getenv("STETIK_ALLOW_UNSUBSCRIBED_ACCESS", "false").lower() == "true":
        return True, "legacy_access"

    # Admin accounts are operational accounts and must remain accessible.
    if account.get("role") == "admin":
        return True, "admin"

    return False, "Cuenta sin trial o suscripción activa"


async def _load_authenticated_account(request: Request) -> dict[str, Any] | None:
    """Resolve the account represented by the request Bearer token."""
    auth = request.headers.get("authorization", "")
    if not auth.lower().startswith("bearer "):
        return None

    token = auth.split(" ", 1)[1].strip()
    try:
        payload = server.jwt.decode(token, server.SECRET_KEY, algorithms=[server.ALGORITHM])
    except Exception:
        return None

    user_id = payload.get("sub")
    token_type = payload.get("type", "user")
    business_id = payload.get("business_id")
    if not user_id:
        return None

    if token_type == "business_user" and business_id:
        account = await server.db.users.find_one({"id": business_id}, {"_id": 0, "password": 0})
        if account is None:
            raise HTTPException(status_code=401, detail="Cuenta de negocio no encontrada")
        business_user = await server.db.business_users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if business_user is None or not business_user.get("activo", True):
            raise HTTPException(status_code=403, detail="Usuario de negocio inactivo")
        return account

    return await server.db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})


class ProductionHardeningMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # These development/manual endpoints must never be exposed in production.
        if path.rstrip("/") == "/api/auth/upgrade" and os.getenv("STETIK_ALLOW_LEGACY_UPGRADE", "false").lower() != "true":
            return server.JSONResponse(
                status_code=410,
                content={"detail": "El upgrade directo está deshabilitado. La activación se realiza mediante el flujo de pago."},
            )

        if ("debug_token" in path or path.rstrip("/").endswith("/auth/debug")) and os.getenv("STETIK_ALLOW_DEBUG_ENDPOINTS", "false").lower() != "true":
            return server.JSONResponse(status_code=404, content={"detail": "Not found"})

        # Enforce subscription status for authenticated API calls. Public auth
        # endpoints remain available so users can register/login/recover access.
        public_prefixes = (
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/api/health",
        )
        if path.startswith("/api/") and not any(path.startswith(p) for p in public_prefixes):
            account = await _load_authenticated_account(request)
            if account is not None:
                allowed, reason = _subscription_is_valid(account)
                if not allowed:
                    return server.JSONResponse(
                        status_code=403,
                        content={
                            "detail": reason,
                            "code": "SUBSCRIPTION_REQUIRED",
                            "account_status": account.get("account_status", "unknown"),
                        },
                    )

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
