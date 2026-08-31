"""Stetik production compatibility entrypoint.

Keeps the existing production_app intact while fixing two deployment/runtime issues:
1. CORS must wrap the complete ASGI application so 500 responses remain readable by browsers.
2. Login must normalize legacy account data and never turn malformed password/date data into an opaque HTML 500.
"""

import logging
import os
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, Request
from fastapi.dependencies.utils import get_dependant
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware

import production_app
import server

logger = logging.getLogger("stetik.entrypoint")
app = production_app.app


def _parse_iso(value: Any):
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
    except (TypeError, ValueError):
        return None


def _safe_verify(password: str, stored_hash: Any) -> bool:
    if not isinstance(stored_hash, str) or not stored_hash:
        return False
    try:
        return bool(server.verify_password(password, stored_hash))
    except Exception:
        logger.exception("Password verification failed")
        return False


def _allowed_account(account: dict[str, Any]):
    status = account.get("account_status", "active")
    if status == "pending":
        raise HTTPException(status_code=403, detail="Tu cuenta está pendiente de activación. Contacta al administrador para activarla.")
    if status in {"suspended", "disabled", "inactive"}:
        raise HTTPException(status_code=403, detail="Tu cuenta no está activa. Contacta al administrador.")

    if account.get("role") == "admin":
        return

    now = datetime.now(timezone.utc)
    subscription_end = _parse_iso(account.get("subscription_ends_at"))
    trial_end = _parse_iso(account.get("trial_ends_at"))

    if subscription_end and subscription_end <= now:
        raise HTTPException(status_code=403, detail="Tu suscripción ha vencido. Contacta al administrador para renovar.")
    if subscription_end is None and trial_end and trial_end <= now:
        raise HTTPException(status_code=403, detail="Tu período de prueba ha vencido. Contacta al administrador para renovar.")


async def login_fixed(credentials: server.UserLogin, request: Request):
    email = (credentials.email or "").strip().lower()
    password = credentials.password or ""
    client_ip = request.client.host if request.client else "unknown"

    try:
        if server.rate_limiter.is_blocked(client_ip):
            raise HTTPException(status_code=429, detail="Demasiados intentos. Espera 5 minutos.")

        user = await server.db.users.find_one({"email": email})

        if not user:
            business_user = await server.db.business_users.find_one({"email": email})
            if not business_user:
                server.rate_limiter.add_request(client_ip)
                raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")

            if not _safe_verify(password, business_user.get("password")):
                server.rate_limiter.add_request(client_ip)
                raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")

            if not business_user.get("activo", True):
                raise HTTPException(status_code=403, detail="Tu cuenta ha sido desactivada. Contacta al propietario del negocio.")

            account = await server.db.users.find_one({"id": business_user.get("business_id")})
            if not account:
                raise HTTPException(status_code=500, detail="Cuenta de negocio no encontrada")
            _allowed_account(account)

            await server.db.business_users.update_one(
                {"id": business_user["id"]},
                {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}},
            )
            token = server.create_access_token({
                "sub": business_user["id"],
                "type": "business_user",
                "business_id": business_user["business_id"],
            })
            return server.TokenResponse(
                access_token=token,
                user=server.UserResponse(
                    id=business_user["id"],
                    email=business_user.get("email", email),
                    nombre=business_user.get("nombre", ""),
                    nombre_negocio=account.get("nombre_negocio", ""),
                    telefono=business_user.get("telefono", ""),
                    plan=account.get("plan", "free"),
                    role=business_user.get("role", "empleado"),
                    user_type="business",
                    created_at=business_user.get("created_at", ""),
                    account_status="active",
                    trial_ends_at=account.get("trial_ends_at"),
                    subscription_starts_at=account.get("subscription_starts_at"),
                    subscription_ends_at=account.get("subscription_ends_at"),
                ),
            )

        if not _safe_verify(password, user.get("password")):
            server.rate_limiter.add_request(client_ip)
            raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")

        if user.get("is_disabled", False):
            raise HTTPException(status_code=403, detail="Tu cuenta ha sido deshabilitada. Contacta al administrador.")

        _allowed_account(user)

        await server.db.users.update_one(
            {"id": user["id"]},
            {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}},
        )

        token = server.create_access_token({"sub": user["id"]})
        return server.TokenResponse(
            access_token=token,
            user=server.UserResponse(
                id=user["id"],
                email=user.get("email", email),
                nombre=user.get("nombre", ""),
                nombre_negocio=user.get("nombre_negocio", ""),
                telefono=user.get("telefono", ""),
                plan=user.get("plan", "free"),
                role=user.get("role", "user"),
                user_type=user.get("user_type", "personal"),
                created_at=user.get("created_at", ""),
                account_status=user.get("account_status", "active"),
                trial_ends_at=user.get("trial_ends_at"),
                subscription_starts_at=user.get("subscription_starts_at"),
                subscription_ends_at=user.get("subscription_ends_at"),
            ),
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception("Unexpected login error for %s", email)
        raise HTTPException(status_code=503, detail="No se pudo iniciar sesión en este momento. Intenta nuevamente.")


for route in app.routes:
    if isinstance(route, APIRoute) and route.path == "/api/auth/login":
        route.endpoint = login_fixed
        route.dependant = get_dependant(path=route.path, call=login_fixed)
        break

cors_origins = [
    "https://app-stetik.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
]
for origin in os.getenv("CORS_ORIGINS", "").split(","):
    origin = origin.strip().rstrip("/")
    if origin and origin != "*" and origin not in cors_origins:
        cors_origins.append(origin)

# Wrap the whole ASGI application. This is important because an unhandled
# exception can otherwise escape the inner CORSMiddleware before it adds headers.
app = CORSMiddleware(
    app=app,
    allow_origins=cors_origins,
    allow_origin_regex=r"^https://app-stetik-[a-z0-9-]+\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Stetik-Code"],
    max_age=600,
)
