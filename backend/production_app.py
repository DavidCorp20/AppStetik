"""Production entrypoint for Stetik.

Use this module for production deployments instead of ``server:app``.
It keeps the existing MVP routes intact while adding a central security layer.
"""

import json
import os
import secrets
from datetime import datetime, timezone, timedelta
from typing import Any

from fastapi import Depends, HTTPException, Request
from fastapi.dependencies.utils import get_dependant
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
from starlette.middleware.base import BaseHTTPMiddleware

try:
    import server
    from indexes import ensure_indexes
except ModuleNotFoundError:
    from backend import server
    from backend.indexes import ensure_indexes

app = server.app


class TenantAwareUser(dict):
    """Compatibility view for business sub-users.

    The original MVP has legacy endpoints that use ``current_user['id']`` for
    business-owned data. For production, those endpoints must resolve to the
    business owner while the authenticated sub-user identity remains available
    as ``identity_id``.
    """

    def __init__(self, data: dict[str, Any], data_owner_id: str):
        super().__init__(data)
        self._data_owner_id = data_owner_id
        super().__setitem__("identity_id", data.get("id"))
        super().__setitem__("effective_user_id", data_owner_id)

    def __getitem__(self, key: str):
        if key == "id":
            return self._data_owner_id
        return super().__getitem__(key)

    def get(self, key: str, default: Any = None):
        if key == "id":
            return self._data_owner_id
        return super().get(key, default)


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

    if os.getenv("STETIK_ALLOW_UNSUBSCRIBED_ACCESS", "false").lower() == "true":
        return True, "legacy_access"

    return False, "Cuenta sin trial o suscripción activa"


async def _hardened_current_user(
    credentials: server.HTTPAuthorizationCredentials = Depends(server.security),
):
    user = await server.get_current_user(credentials)
    account = user
    data_owner_id = user.get("effective_user_id") or user.get("id")

    if user.get("is_business_user") and user.get("business_id"):
        data_owner_id = user["business_id"]
        account = await server.db.users.find_one(
            {"id": data_owner_id}, {"_id": 0, "password": 0}
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

    if user.get("is_business_user"):
        return TenantAwareUser(user, data_owner_id)
    return user


async def _secure_forgot_password(data: server.PasswordResetRequest):
    """Production-safe password recovery.

    The legacy endpoint printed and returned the reset token. Production never
    exposes that token through the API response or application logs.
    """
    user = await server.db.users.find_one({"email": data.email.lower()})
    message = "Si el email existe, recibirás instrucciones para restablecer tu contraseña"
    if not user:
        return {"message": message}

    reset_token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=1)
    await server.db.password_resets.insert_one({
        "email": data.email.lower(),
        "token": reset_token,
        "expires_at": expires.isoformat(),
        "used": False,
    })

    # Email delivery is intentionally left to the future mail provider
    # integration. The token is never returned by this production endpoint.
    return {"message": message}


# Replace only the legacy password-reset request handler. Other MVP routes are
# left untouched and continue to use the existing implementation.
for _route in app.routes:
    if isinstance(_route, APIRoute) and _route.path == "/api/auth/forgot-password" and "POST" in _route.methods:
        _route.endpoint = _secure_forgot_password
        _route.dependant = get_dependant(path=_route.path, call=_secure_forgot_password)
        break


app.dependency_overrides[server.get_current_user] = _hardened_current_user


@app.on_event("startup")
async def production_startup() -> None:
    """Create safe, repeatable MongoDB indexes and verify connectivity."""
    await server.db.command("ping")
    await ensure_indexes(server.db)


@app.get("/health", include_in_schema=False)
async def health() -> dict[str, str]:
    """Lightweight health endpoint for Render and uptime monitors."""
    try:
        await server.db.command("ping")
        return {"status": "ok", "database": "ok"}
    except Exception:
        raise HTTPException(status_code=503, detail="Database unavailable")


async def _read_and_restore_body(request: Request) -> bytes:
    body = await request.body()

    async def receive():
        return {"type": "http.request", "body": body, "more_body": False}

    request._receive = receive
    return body


def _validate_invoice_payload(payload: dict[str, Any]) -> str | None:
    items = payload.get("items") or []
    if not items:
        return "La factura debe contener al menos un item"

    subtotal = 0.0
    for item in items:
        try:
            quantity = float(item.get("cantidad", 0))
            unit_price = float(item.get("precio_unitario", 0))
        except (TypeError, ValueError):
            return "Cantidad y precio unitario deben ser numéricos"
        if quantity <= 0:
            return "La cantidad de cada item debe ser mayor que cero"
        if unit_price < 0:
            return "El precio unitario no puede ser negativo"
        subtotal += quantity * unit_price

    try:
        client_subtotal = float(payload.get("subtotal", 0))
        discount = float(payload.get("descuento", 0))
        client_total = float(payload.get("total", 0))
    except (TypeError, ValueError):
        return "Subtotal, descuento y total deben ser numéricos"

    if discount < 0 or discount > subtotal:
        return "El descuento está fuera de rango"

    expected_total = subtotal - discount
    tolerance = 0.01
    if abs(client_subtotal - subtotal) > tolerance:
        return "El subtotal no coincide con los items"
    if abs(client_total - expected_total) > tolerance:
        return "El total no coincide con los items y el descuento"

    return None


class ProductionHardeningMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path

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

        if (
            "debug_token" in path
            or path.rstrip("/").endswith("/auth/debug")
        ) and os.getenv("STETIK_ALLOW_DEBUG_ENDPOINTS", "false").lower() != "true":
            return JSONResponse(status_code=404, content={"detail": "Not found"})

        if request.method == "POST" and path.rstrip("/") == "/api/facturas":
            try:
                raw = await _read_and_restore_body(request)
                payload = json.loads(raw.decode("utf-8"))
                error = _validate_invoice_payload(payload)
                if error:
                    return JSONResponse(status_code=422, content={"detail": error})
            except (UnicodeDecodeError, json.JSONDecodeError):
                return JSONResponse(status_code=422, content={"detail": "JSON inválido"})

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
