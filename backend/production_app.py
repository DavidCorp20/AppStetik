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

    Legacy MVP endpoints use ``current_user['id']`` for business-owned data.
    Production maps that id to the business owner while preserving the real
    authenticated sub-user identity in ``identity_id``.
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
        # Keep the business account's subscription state in the compatibility
        # view so /auth/me and authorization use the same source of truth.
        enriched_user = {
            **user,
            "account_status": account.get("account_status", "active"),
            "trial_ends_at": account.get("trial_ends_at"),
            "subscription_starts_at": account.get("subscription_starts_at"),
            "subscription_ends_at": account.get("subscription_ends_at"),
            "plan": account.get("plan", "free"),
            "nombre_negocio": account.get("nombre_negocio", ""),
        }
        return TenantAwareUser(enriched_user, data_owner_id)
    return user


def _build_user_response(current_user: dict[str, Any]) -> Any:
    """Build a consistent auth response without losing trial/subscription fields."""
    identity_id = current_user.get("identity_id") or current_user.get("id")
    return server.UserResponse(
        id=identity_id,
        email=current_user.get("email", ""),
        nombre=current_user.get("nombre", ""),
        nombre_negocio=current_user.get("nombre_negocio", ""),
        telefono=current_user.get("telefono", ""),
        plan=current_user.get("plan", "free"),
        role=current_user.get("role", "user"),
        user_type=current_user.get("user_type", "personal"),
        created_at=current_user.get("created_at", ""),
        account_status=current_user.get("account_status", "active"),
        trial_ends_at=current_user.get("trial_ends_at"),
        subscription_starts_at=current_user.get("subscription_starts_at"),
        subscription_ends_at=current_user.get("subscription_ends_at"),
    )


async def _production_get_me(current_user: dict = Depends(_hardened_current_user)):
    return _build_user_response(current_user)


async def _production_update_profile(
    nombre: str | None = None,
    nombre_negocio: str | None = None,
    telefono: str | None = None,
    current_user: dict = Depends(_hardened_current_user),
):
    """Update the authenticated identity, never the tenant owner by accident."""
    identity_id = current_user.get("identity_id") or current_user.get("id")
    update_data: dict[str, str] = {}
    if nombre:
        update_data["nombre"] = server.sanitize_string(nombre)
    if nombre_negocio is not None and not current_user.get("is_business_user"):
        update_data["nombre_negocio"] = server.sanitize_string(nombre_negocio)
    if telefono is not None:
        update_data["telefono"] = server.sanitize_string(telefono)

    if update_data:
        collection = server.db.business_users if current_user.get("is_business_user") else server.db.users
        await collection.update_one({"id": identity_id}, {"$set": update_data})

    if current_user.get("is_business_user"):
        updated = await server.db.business_users.find_one(
            {"id": identity_id}, {"_id": 0, "password": 0}
        )
        business = await server.db.users.find_one(
            {"id": current_user.get("business_id")}, {"_id": 0, "password": 0}
        )
        if updated:
            merged = {**updated, **{
                "nombre_negocio": (business or {}).get("nombre_negocio", ""),
                "plan": (business or {}).get("plan", "free"),
                "user_type": "business",
                "account_status": (business or {}).get("account_status", "active"),
                "trial_ends_at": (business or {}).get("trial_ends_at"),
                "subscription_starts_at": (business or {}).get("subscription_starts_at"),
                "subscription_ends_at": (business or {}).get("subscription_ends_at"),
            }}
            return _build_user_response(merged)

    updated = await server.db.users.find_one({"id": identity_id}, {"_id": 0, "password": 0})
    return _build_user_response(updated or current_user)


async def _production_my_permissions(current_user: dict = Depends(_hardened_current_user)):
    permissions = server.get_user_permissions(current_user)
    identity_id = current_user.get("identity_id") or current_user.get("id")
    return {
        "user_id": identity_id,
        "role": current_user.get("business_role") or (
            "owner" if current_user.get("user_type") == "business" else "personal"
        ),
        "is_business_user": current_user.get("is_business_user", False),
        "permissions": permissions,
        "total_permissions": len(permissions),
    }


async def _secure_forgot_password(data: server.PasswordResetRequest):
    """Production-safe password recovery.

    The legacy endpoint printed and returned the reset token. Production never
    exposes that token through the API response or application logs.
    """
    user = await server.db.users.find_one({"email": data.email.lower()})
    message = "Si el email existe, recibirás instrucciones para restablecer su contraseña"
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
    return {"message": message}


# Replace selected legacy handlers in production while leaving the MVP server
# available for development/rollback.
_ROUTE_REPLACEMENTS = {
    "/api/auth/forgot-password": _secure_forgot_password,
    "/api/auth/me": _production_get_me,
    "/api/auth/profile": _production_update_profile,
    "/api/business/my-permissions": _production_my_permissions,
}
for _route in app.routes:
    if isinstance(_route, APIRoute) and _route.path in _ROUTE_REPLACEMENTS:
        _endpoint = _ROUTE_REPLACEMENTS[_route.path]
        _route.endpoint = _endpoint
        _route.dependant = get_dependant(path=_route.path, call=_endpoint)


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
