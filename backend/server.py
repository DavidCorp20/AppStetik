from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
import secrets
from datetime import datetime, timezone, timedelta
from enum import Enum
from passlib.context import CryptContext
from jose import JWTError, jwt
from collections import defaultdict
import time

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET', 'nailcost-pro-secret-key-2024-secure')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

# ======================
# RATE LIMITING
# ======================
class RateLimiter:
    def __init__(self):
        self.requests: Dict[str, list] = defaultdict(list)
        self.blocked: Dict[str, float] = {}
    
    def is_blocked(self, ip: str) -> bool:
        if ip in self.blocked:
            if time.time() < self.blocked[ip]:
                return True
            del self.blocked[ip]
        return False
    
    def add_request(self, ip: str, max_requests: int = 5, window_seconds: int = 60, block_seconds: int = 300):
        now = time.time()
        # Clean old requests
        self.requests[ip] = [t for t in self.requests[ip] if now - t < window_seconds]
        self.requests[ip].append(now)
        
        if len(self.requests[ip]) > max_requests:
            self.blocked[ip] = now + block_seconds
            return False
        return True

rate_limiter = RateLimiter()

# Create the main app
app = FastAPI(title="NailCost Pro API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ======================
# ENUMS
# ======================
class TipoProducto(str, Enum):
    INSUMO = "insumo"
    HERRAMIENTA = "herramienta"

class NivelDificultad(str, Enum):
    BAJO = "bajo"
    MEDIO = "medio"
    ALTO = "alto"

class PlanType(str, Enum):
    FREE = "free"
    PREMIUM = "premium"

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

class UserType(str, Enum):
    PERSONAL = "personal"
    BUSINESS = "business"

# ======================
# AUTH MODELS
# ======================
class UserRegister(BaseModel):
    email: str
    password: str
    nombre: str
    nombre_negocio: str = ""
    telefono: str = ""
    user_type: str = "personal"  # personal or business

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    nombre: str
    nombre_negocio: str
    telefono: str
    plan: PlanType
    role: str = "user"
    user_type: str = "personal"
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Password Reset Models
class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

# Calculation History Model
class CalculationHistory(BaseModel):
    id: str = ""
    user_id: str = ""
    estilo_id: str
    estilo_nombre: str = ""
    disenos_ids: List[str] = []
    disenos_nombres: List[str] = []
    precio_recomendado: float = 0
    costo_total: float = 0
    ganancia: float = 0
    created_at: str = ""
    cliente_nombre: str = ""
    notas: str = ""

# Employee Model (for business users)
class Employee(BaseModel):
    id: str = ""
    user_id: str = ""
    nombre: str
    email: str = ""
    telefono: str = ""
    especialidad: str = ""
    comision_porcentaje: float = 0
    activo: bool = True
    created_at: str = ""

# Inventory Alert Model
class InventoryAlert(BaseModel):
    producto_id: str
    producto_nombre: str
    cantidad_actual: float
    cantidad_minima: float
    tipo: str  # "bajo", "agotado"

# Inventory Movement Model
class InventoryMovement(BaseModel):
    id: str = ""
    user_id: str = ""
    producto_id: str
    producto_nombre: str = ""
    tipo: str  # "entrada", "salida", "ajuste"
    cantidad: int
    notas: str = ""
    fecha: str = ""

class MovementCreate(BaseModel):
    producto_id: str
    tipo: str
    cantidad: int
    notas: str = ""

# Invoice Models
class InvoiceItem(BaseModel):
    descripcion: str
    cantidad: int = 1
    precio_unitario: float

class InvoiceCreate(BaseModel):
    cliente_id: str
    cliente_nombre: str
    cliente_telefono: str = ""
    cliente_email: str = ""
    items: List[InvoiceItem]
    subtotal: float
    descuento: float = 0
    total: float
    metodo_pago: str = "efectivo"
    notas: str = ""
    estado: str = "pendiente"

class InvoiceStatusUpdate(BaseModel):
    estado: str

# Plan Limits
PLAN_LIMITS = {
    "free": {
        "max_productos": 10,
        "max_estilos": 5,
        "max_disenos": 5,
        "max_clientes": 20,
        "can_export": False,
        "can_simulate": False,
        "can_view_reports": False,
    },
    "premium": {
        "max_productos": 999,
        "max_estilos": 999,
        "max_disenos": 999,
        "max_clientes": 999,
        "can_export": True,
        "can_simulate": True,
        "can_view_reports": True,
    }
}

# ======================
# AUTH HELPERS
# ======================
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user

async def check_plan_limit(user: dict, resource: str, current_count: int):
    """Check if user can add more of a resource based on their plan"""
    plan = user.get("plan", "free")
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
    limit_key = f"max_{resource}"
    
    if limit_key in limits and current_count >= limits[limit_key]:
        raise HTTPException(
            status_code=403, 
            detail=f"Has alcanzado el límite de {resource} en tu plan {plan}. Actualiza a Premium para más."
        )

async def check_premium_feature(user: dict, feature: str):
    """Check if user has access to a premium feature"""
    plan = user.get("plan", "free")
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
    
    if not limits.get(feature, False):
        raise HTTPException(
            status_code=403,
            detail=f"Esta función requiere plan Premium. Actualiza tu plan para acceder."
        )

# ======================
# MODELS
# ======================

# Producto Model
class ProductoBase(BaseModel):
    nombre: str
    tipo: TipoProducto
    precio_compra: float
    cantidad_comprada: float
    unidad: str = "unidades"
    uso_por_servicio: float
    
class ProductoCreate(ProductoBase):
    pass

class Producto(ProductoBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    costo_unitario: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Estilo de Uñas Model
class ProductoEnEstilo(BaseModel):
    producto_id: str
    cantidad: float

class EstiloBase(BaseModel):
    nombre: str
    descripcion: str = ""
    productos_usados: List[ProductoEnEstilo] = []
    tiempo_trabajo_minutos: int
    nivel_dificultad: NivelDificultad
    
class EstiloCreate(EstiloBase):
    pass

class Estilo(EstiloBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    costo_productos: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Diseño/Decoración Model
class DisenoBase(BaseModel):
    nombre: str
    costo_adicional: float
    tiempo_adicional_minutos: int
    nivel_complejidad: NivelDificultad

class DisenoCreate(DisenoBase):
    pass

class Diseno(DisenoBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ======================
# CLIENTE MODEL
# ======================
class ClienteBase(BaseModel):
    nombre: str
    telefono: str = ""
    email: str = ""
    notas: str = ""

class ClienteCreate(ClienteBase):
    pass

class Cliente(ClienteBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    total_visitas: int = 0
    ultima_visita: Optional[str] = None

# ======================
# CITA MODEL
# ======================
class EstadoCita(str, Enum):
    PENDIENTE = "pendiente"
    CONFIRMADA = "confirmada"
    COMPLETADA = "completada"
    CANCELADA = "cancelada"

class CitaBase(BaseModel):
    cliente_id: str
    fecha: str  # ISO date string
    hora: str  # HH:MM format
    estilo_id: str
    disenos_ids: List[str] = []
    notas: str = ""
    precio_estimado: float = 0.0

class CitaCreate(CitaBase):
    pass

class CitaUpdate(BaseModel):
    cliente_id: Optional[str] = None
    fecha: Optional[str] = None
    hora: Optional[str] = None
    estilo_id: Optional[str] = None
    disenos_ids: Optional[List[str]] = None
    notas: Optional[str] = None
    precio_estimado: Optional[float] = None
    estado: Optional[EstadoCita] = None

class Cita(CitaBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    estado: EstadoCita = EstadoCita.PENDIENTE
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ======================
# SERVICIO REALIZADO MODEL
# ======================
class ServicioRealizadoBase(BaseModel):
    cliente_id: str
    cita_id: Optional[str] = None
    fecha: str  # ISO date string
    estilo_id: str
    disenos_ids: List[str] = []
    precio_cobrado: float
    costo_real: float
    notas: str = ""

class ServicioRealizadoCreate(ServicioRealizadoBase):
    pass

class ServicioRealizado(ServicioRealizadoBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ganancia: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Gastos Operativos Model
class GastosOperativos(BaseModel):
    model_config = ConfigDict(extra="ignore")
    renta: float = 0.0
    luz: float = 0.0
    agua: float = 0.0
    internet: float = 0.0
    telefono: float = 0.0
    publicidad: float = 0.0
    mantenimiento: float = 0.0
    material_limpieza: float = 0.0
    plataformas_pago: float = 0.0
    impuestos: float = 0.0
    otros: float = 0.0
    # División
    clientes_mes: int = 30
    servicios_mes: int = 60
    dias_trabajo: int = 22

class GastosOperativosUpdate(BaseModel):
    renta: Optional[float] = None
    luz: Optional[float] = None
    agua: Optional[float] = None
    internet: Optional[float] = None
    telefono: Optional[float] = None
    publicidad: Optional[float] = None
    mantenimiento: Optional[float] = None
    material_limpieza: Optional[float] = None
    plataformas_pago: Optional[float] = None
    impuestos: Optional[float] = None
    otros: Optional[float] = None
    clientes_mes: Optional[int] = None
    servicios_mes: Optional[int] = None
    dias_trabajo: Optional[int] = None

# Configuración de Ganancias Model
class ConfigGanancias(BaseModel):
    model_config = ConfigDict(extra="ignore")
    porcentaje_ganancia: float = 30.0
    meta_ingreso_mensual: float = 2000.0
    meta_diaria: float = 100.0
    sueldo_objetivo: float = 1500.0
    costo_hora_trabajo: float = 15.0

class ConfigGananciasUpdate(BaseModel):
    porcentaje_ganancia: Optional[float] = None
    meta_ingreso_mensual: Optional[float] = None
    meta_diaria: Optional[float] = None
    sueldo_objetivo: Optional[float] = None
    costo_hora_trabajo: Optional[float] = None

# Cálculo de Precio Model
class CalculoPrecioRequest(BaseModel):
    estilo_id: str
    disenos_ids: List[str] = []

class CalculoPrecioResponse(BaseModel):
    estilo_nombre: str
    costo_productos: float
    costo_operativo_prorrateado: float
    costo_tiempo_trabajo: float
    costo_disenos: float
    costo_total: float
    margen_ganancia: float
    precio_minimo_rentable: float
    precio_recomendado: float
    ganancia_real: float
    rentabilidad_hora: float
    tiempo_total_minutos: int
    alertas: List[str] = []

# Reporte Model
class ReporteCompleto(BaseModel):
    fecha_generacion: str
    gastos_operativos: GastosOperativos
    config_ganancias: ConfigGanancias
    total_productos: int
    total_estilos: int
    total_disenos: int
    gasto_operativo_total: float
    gasto_por_servicio: float
    servicios_ranking: List[dict] = []
    rentabilidad_mensual_estimada: float

# ======================
# ENDPOINTS - Auth
# ======================
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Este email ya está registrado")
    
    # Create user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_data.password)
    
    user_doc = {
        "id": user_id,
        "email": user_data.email.lower(),
        "password": hashed_password,
        "nombre": user_data.nombre,
        "nombre_negocio": user_data.nombre_negocio,
        "telefono": user_data.telefono,
        "plan": "free",
        "role": "user",
        "user_type": user_data.user_type,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    
    await db.users.insert_one(user_doc)
    
    # Create token
    access_token = create_access_token(data={"sub": user_id})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user_id,
            email=user_doc["email"],
            nombre=user_doc["nombre"],
            nombre_negocio=user_doc["nombre_negocio"],
            telefono=user_doc["telefono"],
            plan=user_doc["plan"],
            role=user_doc["role"],
            user_type=user_doc.get("user_type", "personal"),
            created_at=user_doc["created_at"]
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin, request: Request):
    # Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    if rate_limiter.is_blocked(client_ip):
        raise HTTPException(status_code=429, detail="Demasiados intentos. Espera 5 minutos.")
    
    user = await db.users.find_one({"email": credentials.email.lower()})
    if not user:
        rate_limiter.add_request(client_ip)
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")
    
    if not verify_password(credentials.password, user["password"]):
        rate_limiter.add_request(client_ip)
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")
    
    # Check if user is disabled
    if user.get("is_disabled", False):
        raise HTTPException(status_code=403, detail="Tu cuenta ha sido deshabilitada. Contacta al administrador.")
    
    # Update last login
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
    )
    
    access_token = create_access_token(data={"sub": user["id"]})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            nombre=user["nombre"],
            nombre_negocio=user.get("nombre_negocio", ""),
            telefono=user.get("telefono", ""),
            plan=user.get("plan", "free"),
            role=user.get("role", "user"),
            user_type=user.get("user_type", "personal"),
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        nombre=current_user["nombre"],
        nombre_negocio=current_user.get("nombre_negocio", ""),
        telefono=current_user.get("telefono", ""),
        plan=current_user.get("plan", "free"),
        role=current_user.get("role", "user"),
        user_type=current_user.get("user_type", "personal"),
        created_at=current_user["created_at"]
    )

# Password Reset Endpoints
@api_router.post("/auth/forgot-password")
async def forgot_password(data: PasswordResetRequest):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user:
        # Don't reveal if email exists
        return {"message": "Si el email existe, recibirás instrucciones para restablecer tu contraseña"}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=1)
    
    await db.password_resets.insert_one({
        "email": data.email.lower(),
        "token": reset_token,
        "expires_at": expires.isoformat(),
        "used": False
    })
    
    # In production, send email. For now, log to console
    logging.info(f"🔑 PASSWORD RESET TOKEN for {data.email}: {reset_token}")
    print(f"\n{'='*60}")
    print(f"🔑 TOKEN DE RECUPERACIÓN DE CONTRASEÑA")
    print(f"Email: {data.email}")
    print(f"Token: {reset_token}")
    print(f"Expira en: 1 hora")
    print(f"{'='*60}\n")
    
    return {"message": "Si el email existe, recibirás instrucciones para restablecer tu contraseña", "debug_token": reset_token}

@api_router.post("/auth/reset-password")
async def reset_password(data: PasswordResetConfirm):
    # Find valid token
    reset_record = await db.password_resets.find_one({
        "token": data.token,
        "used": False
    })
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")
    
    # Check expiration
    expires_at = datetime.fromisoformat(reset_record["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Token expirado")
    
    # Update password
    hashed = get_password_hash(data.new_password)
    await db.users.update_one(
        {"email": reset_record["email"]},
        {"$set": {"password": hashed}}
    )
    
    # Mark token as used
    await db.password_resets.update_one(
        {"token": data.token},
        {"$set": {"used": True}}
    )
    
    return {"message": "Contraseña actualizada exitosamente"}

@api_router.put("/auth/profile")
async def update_profile(
    nombre: Optional[str] = None,
    nombre_negocio: Optional[str] = None,
    telefono: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    update_data = {}
    if nombre: update_data["nombre"] = nombre
    if nombre_negocio is not None: update_data["nombre_negocio"] = nombre_negocio
    if telefono is not None: update_data["telefono"] = telefono
    
    if update_data:
        await db.users.update_one({"id": current_user["id"]}, {"$set": update_data})
    
    updated = await db.users.find_one({"id": current_user["id"]}, {"_id": 0, "password": 0})
    return updated

@api_router.get("/auth/plan-limits")
async def get_plan_limits(current_user: dict = Depends(get_current_user)):
    """Get current user's plan limits and usage"""
    user_id = current_user["id"]
    plan = current_user.get("plan", "free")
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
    
    # Get current counts
    productos_count = await db.productos.count_documents({"user_id": user_id})
    estilos_count = await db.estilos.count_documents({"user_id": user_id})
    disenos_count = await db.disenos.count_documents({"user_id": user_id})
    clientes_count = await db.clientes.count_documents({"user_id": user_id})
    
    return {
        "plan": plan,
        "limits": limits,
        "usage": {
            "productos": productos_count,
            "estilos": estilos_count,
            "disenos": disenos_count,
            "clientes": clientes_count,
        }
    }

@api_router.post("/auth/upgrade")
async def upgrade_plan(current_user: dict = Depends(get_current_user)):
    """Upgrade user to premium (placeholder for payment integration)"""
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"plan": "premium"}}
    )
    return {"message": "Plan actualizado a Premium", "plan": "premium"}

# ======================
# ADMIN ENDPOINTS
# ======================
async def get_admin_user(current_user: dict = Depends(get_current_user)):
    """Check if user is admin"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado. Se requiere rol de administrador.")
    return current_user

@api_router.get("/admin/users")
async def admin_get_users(admin: dict = Depends(get_admin_user)):
    """Get all users (admin only)"""
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    
    # Add usage stats for each user
    for user in users:
        user_id = user["id"]
        user["stats"] = {
            "productos": await db.productos.count_documents({"user_id": user_id}),
            "estilos": await db.estilos.count_documents({"user_id": user_id}),
            "disenos": await db.disenos.count_documents({"user_id": user_id}),
            "clientes": await db.clientes.count_documents({"user_id": user_id}),
        }
    
    return users

@api_router.put("/admin/users/{user_id}/plan")
async def admin_update_user_plan(user_id: str, plan: str, admin: dict = Depends(get_admin_user)):
    """Update a user's plan (admin only)"""
    if plan not in ["free", "premium"]:
        raise HTTPException(status_code=400, detail="Plan inválido. Usa 'free' o 'premium'.")
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"plan": plan}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return {"message": f"Plan actualizado a {plan}", "user_id": user_id, "plan": plan}

@api_router.get("/admin/stats")
async def admin_get_stats(admin: dict = Depends(get_admin_user)):
    """Get overall system stats (admin only)"""
    total_users = await db.users.count_documents({})
    premium_users = await db.users.count_documents({"plan": "premium"})
    free_users = await db.users.count_documents({"plan": "free"})
    
    # Count by user type and plan
    personal_basic = await db.users.count_documents({"user_type": "personal", "plan": "free"})
    personal_premium = await db.users.count_documents({"user_type": "personal", "plan": "premium"})
    business_basic = await db.users.count_documents({"user_type": "business", "plan": "free"})
    business_premium = await db.users.count_documents({"user_type": "business", "plan": "premium"})
    
    # Count active users (logged in last 30 days)
    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    active_users = await db.users.count_documents({"last_login": {"$gte": thirty_days_ago}})
    
    # Count disabled users
    disabled_users = await db.users.count_documents({"is_disabled": True})
    
    return {
        "total_users": total_users,
        "premium_users": premium_users,
        "free_users": free_users,
        "active_users": active_users,
        "disabled_users": disabled_users,
        "by_type": {
            "personal_basic": personal_basic,
            "personal_premium": personal_premium,
            "business_basic": business_basic,
            "business_premium": business_premium,
        },
        "total_productos": await db.productos.count_documents({}),
        "total_estilos": await db.estilos.count_documents({}),
        "total_clientes": await db.clientes.count_documents({}),
        "total_citas": await db.citas.count_documents({}),
        "total_facturas": await db.facturas.count_documents({}),
    }

# Pricing configuration
PRICING = {
    "personal": {"basic": 5, "premium": 10},
    "business": {"basic": 15, "premium": 20}
}

@api_router.get("/admin/revenue")
async def admin_get_revenue(admin: dict = Depends(get_admin_user)):
    """Get revenue projections based on pricing tiers"""
    
    # Count users by type and plan
    personal_basic = await db.users.count_documents({"user_type": "personal", "plan": "free", "is_disabled": {"$ne": True}})
    personal_premium = await db.users.count_documents({"user_type": "personal", "plan": "premium", "is_disabled": {"$ne": True}})
    business_basic = await db.users.count_documents({"user_type": "business", "plan": "free", "is_disabled": {"$ne": True}})
    business_premium = await db.users.count_documents({"user_type": "business", "plan": "premium", "is_disabled": {"$ne": True}})
    
    # Calculate revenue
    monthly_revenue = (
        (personal_basic * PRICING["personal"]["basic"]) +
        (personal_premium * PRICING["personal"]["premium"]) +
        (business_basic * PRICING["business"]["basic"]) +
        (business_premium * PRICING["business"]["premium"])
    )
    
    annual_revenue = monthly_revenue * 12
    
    return {
        "pricing": PRICING,
        "subscribers": {
            "personal_basic": personal_basic,
            "personal_premium": personal_premium,
            "business_basic": business_basic,
            "business_premium": business_premium,
            "total_paying": personal_basic + personal_premium + business_basic + business_premium
        },
        "revenue": {
            "monthly": monthly_revenue,
            "annual": annual_revenue,
            "breakdown": {
                "personal_basic": personal_basic * PRICING["personal"]["basic"],
                "personal_premium": personal_premium * PRICING["personal"]["premium"],
                "business_basic": business_basic * PRICING["business"]["basic"],
                "business_premium": business_premium * PRICING["business"]["premium"],
            }
        }
    }

@api_router.post("/admin/users/{user_id}/reset-password")
async def admin_reset_password(user_id: str, admin: dict = Depends(get_admin_user)):
    """Reset user password to a temporary one (admin only)"""
    # Generate temporary password
    temp_password = secrets.token_urlsafe(12)
    hashed = get_password_hash(temp_password)
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"password": hashed, "password_reset_required": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "email": 1, "nombre": 1})
    
    return {
        "message": "Contraseña blanqueada exitosamente",
        "user_email": user["email"],
        "temp_password": temp_password,
        "note": "El usuario deberá cambiar esta contraseña al iniciar sesión"
    }

@api_router.post("/admin/users/{user_id}/toggle-status")
async def admin_toggle_user_status(user_id: str, admin: dict = Depends(get_admin_user)):
    """Enable/disable a user account (admin only)"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if user.get("role") == "admin":
        raise HTTPException(status_code=400, detail="No se puede deshabilitar una cuenta de administrador")
    
    new_status = not user.get("is_disabled", False)
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_disabled": new_status}}
    )
    
    return {
        "message": f"Usuario {'deshabilitado' if new_status else 'habilitado'}",
        "is_disabled": new_status
    }

@api_router.put("/admin/users/{user_id}/type")
async def admin_update_user_type(user_id: str, user_type: str, admin: dict = Depends(get_admin_user)):
    """Change user type (personal/business) - admin only"""
    if user_type not in ["personal", "business"]:
        raise HTTPException(status_code=400, detail="Tipo inválido. Usa 'personal' o 'business'.")
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"user_type": user_type}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return {"message": f"Tipo actualizado a {user_type}", "user_id": user_id, "user_type": user_type}

# ======================
# ENDPOINTS - Calculation History
# ======================
@api_router.get("/historial-calculos")
async def get_historial_calculos(current_user: dict = Depends(get_current_user)):
    """Get calculation history for user"""
    historial = await db.historial_calculos.find(
        {"user_id": current_user["id"]}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return historial

@api_router.post("/historial-calculos")
async def save_calculo(calculo: dict, current_user: dict = Depends(get_current_user)):
    """Save a calculation to history"""
    calculo_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "estilo_id": calculo.get("estilo_id", ""),
        "estilo_nombre": calculo.get("estilo_nombre", ""),
        "disenos_ids": calculo.get("disenos_ids", []),
        "disenos_nombres": calculo.get("disenos_nombres", []),
        "precio_recomendado": calculo.get("precio_recomendado", 0),
        "costo_total": calculo.get("costo_total", 0),
        "ganancia": calculo.get("ganancia", 0),
        "cliente_nombre": calculo.get("cliente_nombre", ""),
        "notas": calculo.get("notas", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.historial_calculos.insert_one(calculo_doc)
    calculo_doc.pop("_id", None)
    return calculo_doc

@api_router.delete("/historial-calculos/{calculo_id}")
async def delete_calculo(calculo_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a calculation from history"""
    result = await db.historial_calculos.delete_one({
        "id": calculo_id, 
        "user_id": current_user["id"]
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cálculo no encontrado")
    return {"message": "Cálculo eliminado"}

# ======================
# ENDPOINTS - Employees (Business Users)
# ======================
@api_router.get("/empleados")
async def get_empleados(current_user: dict = Depends(get_current_user)):
    """Get employees for business user"""
    if current_user.get("user_type") != "business":
        return []
    empleados = await db.empleados.find(
        {"user_id": current_user["id"]}, 
        {"_id": 0}
    ).to_list(100)
    return empleados

@api_router.post("/empleados")
async def create_empleado(empleado: dict, current_user: dict = Depends(get_current_user)):
    """Create a new employee"""
    if current_user.get("user_type") != "business":
        raise HTTPException(status_code=403, detail="Solo usuarios de negocio pueden agregar empleados")
    
    empleado_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "nombre": empleado.get("nombre", ""),
        "email": empleado.get("email", ""),
        "telefono": empleado.get("telefono", ""),
        "especialidad": empleado.get("especialidad", ""),
        "comision_porcentaje": empleado.get("comision_porcentaje", 0),
        "activo": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.empleados.insert_one(empleado_doc)
    return {k: v for k, v in empleado_doc.items() if k != "_id"}

@api_router.put("/empleados/{empleado_id}")
async def update_empleado(empleado_id: str, empleado: dict, current_user: dict = Depends(get_current_user)):
    """Update an employee"""
    result = await db.empleados.update_one(
        {"id": empleado_id, "user_id": current_user["id"]},
        {"$set": {
            "nombre": empleado.get("nombre"),
            "email": empleado.get("email"),
            "telefono": empleado.get("telefono"),
            "especialidad": empleado.get("especialidad"),
            "comision_porcentaje": empleado.get("comision_porcentaje"),
            "activo": empleado.get("activo", True),
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return {"message": "Empleado actualizado"}

@api_router.delete("/empleados/{empleado_id}")
async def delete_empleado(empleado_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an employee"""
    result = await db.empleados.delete_one({
        "id": empleado_id, 
        "user_id": current_user["id"]
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return {"message": "Empleado eliminado"}

# ======================
# ENDPOINTS - Inventory Alerts
# ======================
@api_router.get("/alertas-inventario")
async def get_alertas_inventario(current_user: dict = Depends(get_current_user)):
    """Get inventory alerts (low stock)"""
    productos = await db.productos.find(
        {"user_id": current_user["id"]}, 
        {"_id": 0}
    ).to_list(1000)
    
    alertas = []
    for p in productos:
        # Check if producto has stock tracking
        stock_actual = p.get("stock_actual", p.get("cantidad_comprada", 0))
        stock_minimo = p.get("stock_minimo", 5)
        
        if stock_actual <= 0:
            alertas.append({
                "producto_id": p["id"],
                "producto_nombre": p["nombre"],
                "cantidad_actual": stock_actual,
                "cantidad_minima": stock_minimo,
                "tipo": "agotado"
            })
        elif stock_actual <= stock_minimo:
            alertas.append({
                "producto_id": p["id"],
                "producto_nombre": p["nombre"],
                "cantidad_actual": stock_actual,
                "cantidad_minima": stock_minimo,
                "tipo": "bajo"
            })
    
    return alertas

# ======================
# ENDPOINTS - Inventory Movements
# ======================
@api_router.get("/inventario/movimientos")
async def get_inventory_movements(current_user: dict = Depends(get_current_user)):
    """Get inventory movements"""
    movimientos = await db.inventario_movimientos.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("fecha", -1).to_list(100)
    return movimientos

@api_router.post("/inventario/movimiento")
async def create_inventory_movement(
    movement: MovementCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create inventory movement (entrada/salida/ajuste)"""
    # Get product
    producto = await db.productos.find_one({
        "id": movement.producto_id,
        "user_id": current_user["id"]
    })
    
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    # Calculate new stock
    stock_actual = producto.get("cantidad_disponible", producto.get("cantidad_comprada", 0))
    
    if movement.tipo == "entrada":
        new_stock = stock_actual + movement.cantidad
    elif movement.tipo == "salida":
        if movement.cantidad > stock_actual:
            raise HTTPException(status_code=400, detail="Stock insuficiente")
        new_stock = stock_actual - movement.cantidad
    else:  # ajuste
        new_stock = movement.cantidad
    
    # Update product stock
    await db.productos.update_one(
        {"id": movement.producto_id, "user_id": current_user["id"]},
        {"$set": {"cantidad_disponible": new_stock}}
    )
    
    # Record movement
    mov_data = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "producto_id": movement.producto_id,
        "producto_nombre": producto["nombre"],
        "tipo": movement.tipo,
        "cantidad": movement.cantidad,
        "stock_anterior": stock_actual,
        "stock_nuevo": new_stock,
        "notas": movement.notas,
        "fecha": datetime.now(timezone.utc).isoformat()
    }
    
    await db.inventario_movimientos.insert_one(mov_data)
    
    return {"message": "Movimiento registrado", "new_stock": new_stock}

# ======================
# ENDPOINTS - Invoices (Facturación)
# ======================
@api_router.get("/facturas")
async def get_invoices(current_user: dict = Depends(get_current_user)):
    """Get all invoices"""
    facturas = await db.facturas.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("fecha", -1).to_list(500)
    return facturas

@api_router.post("/facturas")
async def create_invoice(invoice: InvoiceCreate, current_user: dict = Depends(get_current_user)):
    """Create new invoice"""
    # Get next invoice number
    last_invoice = await db.facturas.find_one(
        {"user_id": current_user["id"]},
        sort=[("numero", -1)]
    )
    next_number = (last_invoice.get("numero", 0) if last_invoice else 0) + 1
    
    factura_data = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "numero": next_number,
        "cliente_id": invoice.cliente_id,
        "cliente_nombre": invoice.cliente_nombre,
        "cliente_telefono": invoice.cliente_telefono,
        "cliente_email": invoice.cliente_email,
        "items": [item.model_dump() for item in invoice.items],
        "subtotal": invoice.subtotal,
        "descuento": invoice.descuento,
        "total": invoice.total,
        "metodo_pago": invoice.metodo_pago,
        "notas": invoice.notas,
        "estado": invoice.estado,
        "fecha": datetime.now(timezone.utc).isoformat()
    }
    
    await db.facturas.insert_one(factura_data)
    del factura_data["_id"]
    
    return factura_data

@api_router.put("/facturas/{factura_id}/estado")
async def update_invoice_status(
    factura_id: str, 
    status: InvoiceStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update invoice status"""
    result = await db.facturas.update_one(
        {"id": factura_id, "user_id": current_user["id"]},
        {"$set": {"estado": status.estado}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Factura no encontrada")
    return {"message": "Estado actualizado"}

@api_router.delete("/facturas/{factura_id}")
async def delete_invoice(factura_id: str, current_user: dict = Depends(get_current_user)):
    """Delete invoice"""
    result = await db.facturas.delete_one({
        "id": factura_id,
        "user_id": current_user["id"]
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Factura no encontrada")
    return {"message": "Factura eliminada"}

# ======================
# ENDPOINTS - Quick Stats (for dashboard)
# ======================
@api_router.get("/quick-stats")
async def get_quick_stats(current_user: dict = Depends(get_current_user)):
    """Get quick stats for dashboard based on user type"""
    user_id = current_user["id"]
    user_type = current_user.get("user_type", "personal")
    
    # Common stats
    stats = {
        "productos": await db.productos.count_documents({"user_id": user_id}),
        "estilos": await db.estilos.count_documents({"user_id": user_id}),
        "disenos": await db.disenos.count_documents({"user_id": user_id}),
        "clientes": await db.clientes.count_documents({"user_id": user_id}),
        "citas_pendientes": await db.citas.count_documents({
            "user_id": user_id, 
            "estado": {"$in": ["pendiente", "confirmada"]}
        }),
        "calculos_hoy": await db.historial_calculos.count_documents({
            "user_id": user_id,
            "created_at": {"$gte": datetime.now(timezone.utc).strftime("%Y-%m-%d")}
        }),
    }
    
    # Business-specific stats
    if user_type == "business":
        stats["empleados"] = await db.empleados.count_documents({
            "user_id": user_id, 
            "activo": True
        })
        stats["servicios_mes"] = await db.servicios_realizados.count_documents({
            "user_id": user_id,
            "fecha": {"$gte": datetime.now(timezone.utc).strftime("%Y-%m")}
        })
    
    return stats

# ======================
# ENDPOINTS - Profitability Tips (AI-like suggestions)
# ======================
@api_router.get("/tips-rentabilidad")
async def get_tips_rentabilidad(current_user: dict = Depends(get_current_user)):
    """Get profitability tips based on user data"""
    user_id = current_user["id"]
    tips = []
    
    # Get user data
    estilos = await db.estilos.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    gastos = await db.gastos_operativos.find_one({"user_id": user_id}, {"_id": 0})
    config = await db.config_ganancias.find_one({"user_id": user_id}, {"_id": 0})
    historial = await db.historial_calculos.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    
    # Generate tips
    if len(estilos) < 3:
        tips.append({
            "tipo": "crecimiento",
            "icono": "palette",
            "titulo": "Amplía tu catálogo",
            "mensaje": "Agrega más estilos de uñas para ofrecer más opciones a tus clientes.",
            "accion": "/estilos"
        })
    
    if not gastos or gastos.get("renta", 0) == 0:
        tips.append({
            "tipo": "configuracion",
            "icono": "settings",
            "titulo": "Configura tus gastos",
            "mensaje": "Registra tus gastos operativos para calcular precios más precisos.",
            "accion": "/gastos"
        })
    
    if config and config.get("porcentaje_ganancia", 0) < 30:
        tips.append({
            "tipo": "rentabilidad",
            "icono": "trending-up",
            "titulo": "Aumenta tu margen",
            "mensaje": f"Tu margen actual es {config.get('porcentaje_ganancia', 0)}%. Considera aumentarlo al 30-40% para mejor rentabilidad.",
            "accion": "/ganancias"
        })
    
    if len(historial) > 10:
        # Find most calculated style
        style_counts = {}
        for h in historial:
            style_name = h.get("estilo_nombre", "")
            style_counts[style_name] = style_counts.get(style_name, 0) + 1
        
        if style_counts:
            top_style = max(style_counts, key=style_counts.get)
            tips.append({
                "tipo": "insight",
                "icono": "star",
                "titulo": "Tu servicio estrella",
                "mensaje": f'"{top_style}" es tu servicio más calculado. Considera promocionarlo más.',
                "accion": "/calculadora"
            })
    
    # Low profit services warning
    for estilo in estilos:
        if estilo.get("precio_sugerido", 0) > 0 and estilo.get("costo_total", 0) > 0:
            margen = ((estilo["precio_sugerido"] - estilo["costo_total"]) / estilo["precio_sugerido"]) * 100
            if margen < 20:
                tips.append({
                    "tipo": "alerta",
                    "icono": "alert-triangle",
                    "titulo": f"Revisa: {estilo['nombre']}",
                    "mensaje": f"Este servicio tiene un margen bajo ({margen:.0f}%). Considera ajustar el precio.",
                    "accion": "/estilos"
                })
                break  # Only show one
    
    return tips[:5]  # Return max 5 tips

# ======================
# ENDPOINTS - Productos (Protected)
# ======================
@api_router.get("/productos", response_model=List[Producto])
async def get_productos(current_user: dict = Depends(get_current_user)):
    productos = await db.productos.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    return productos

@api_router.post("/productos", response_model=Producto)
async def create_producto(producto: ProductoCreate, current_user: dict = Depends(get_current_user)):
    # Check plan limit
    count = await db.productos.count_documents({"user_id": current_user["id"]})
    await check_plan_limit(current_user, "productos", count)
    
    producto_dict = producto.model_dump()
    producto_obj = Producto(**producto_dict)
    # Calcular costo unitario
    if producto_obj.cantidad_comprada > 0:
        producto_obj.costo_unitario = producto_obj.precio_compra / producto_obj.cantidad_comprada * producto_obj.uso_por_servicio
    
    doc = producto_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['user_id'] = current_user["id"]
    await db.productos.insert_one(doc)
    return producto_obj

@api_router.put("/productos/{producto_id}", response_model=Producto)
async def update_producto(producto_id: str, producto: ProductoCreate, current_user: dict = Depends(get_current_user)):
    producto_dict = producto.model_dump()
    # Calcular costo unitario
    costo_unitario = 0.0
    if producto_dict['cantidad_comprada'] > 0:
        costo_unitario = producto_dict['precio_compra'] / producto_dict['cantidad_comprada'] * producto_dict['uso_por_servicio']
    
    producto_dict['costo_unitario'] = costo_unitario
    
    result = await db.productos.update_one(
        {"id": producto_id, "user_id": current_user["id"]},
        {"$set": producto_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    updated = await db.productos.find_one({"id": producto_id}, {"_id": 0})
    return updated

@api_router.delete("/productos/{producto_id}")
async def delete_producto(producto_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.productos.delete_one({"id": producto_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {"message": "Producto eliminado"}

# ======================
# ENDPOINTS - Estilos (Protected)
# ======================
@api_router.get("/estilos", response_model=List[Estilo])
async def get_estilos(current_user: dict = Depends(get_current_user)):
    estilos = await db.estilos.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    return estilos

@api_router.post("/estilos", response_model=Estilo)
async def create_estilo(estilo: EstiloCreate, current_user: dict = Depends(get_current_user)):
    count = await db.estilos.count_documents({"user_id": current_user["id"]})
    await check_plan_limit(current_user, "estilos", count)
    
    estilo_dict = estilo.model_dump()
    estilo_obj = Estilo(**estilo_dict)
    
    # Calcular costo de productos
    costo_total = 0.0
    for prod_uso in estilo_obj.productos_usados:
        producto = await db.productos.find_one({"id": prod_uso.producto_id, "user_id": current_user["id"]}, {"_id": 0})
        if producto:
            costo_total += producto['costo_unitario'] * prod_uso.cantidad
    estilo_obj.costo_productos = costo_total
    
    doc = estilo_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['user_id'] = current_user["id"]
    await db.estilos.insert_one(doc)
    return estilo_obj

@api_router.put("/estilos/{estilo_id}", response_model=Estilo)
async def update_estilo(estilo_id: str, estilo: EstiloCreate, current_user: dict = Depends(get_current_user)):
    estilo_dict = estilo.model_dump()
    
    # Recalcular costo de productos
    costo_total = 0.0
    for prod_uso in estilo_dict['productos_usados']:
        producto = await db.productos.find_one({"id": prod_uso['producto_id'], "user_id": current_user["id"]}, {"_id": 0})
        if producto:
            costo_total += producto['costo_unitario'] * prod_uso['cantidad']
    estilo_dict['costo_productos'] = costo_total
    
    result = await db.estilos.update_one(
        {"id": estilo_id, "user_id": current_user["id"]},
        {"$set": estilo_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Estilo no encontrado")
    
    updated = await db.estilos.find_one({"id": estilo_id}, {"_id": 0})
    return updated

@api_router.delete("/estilos/{estilo_id}")
async def delete_estilo(estilo_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.estilos.delete_one({"id": estilo_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Estilo no encontrado")
    return {"message": "Estilo eliminado"}

# ======================
# ENDPOINTS - Diseños (Protected)
# ======================
@api_router.get("/disenos", response_model=List[Diseno])
async def get_disenos(current_user: dict = Depends(get_current_user)):
    disenos = await db.disenos.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    return disenos

@api_router.post("/disenos", response_model=Diseno)
async def create_diseno(diseno: DisenoCreate, current_user: dict = Depends(get_current_user)):
    count = await db.disenos.count_documents({"user_id": current_user["id"]})
    await check_plan_limit(current_user, "disenos", count)
    
    diseno_dict = diseno.model_dump()
    diseno_obj = Diseno(**diseno_dict)
    
    doc = diseno_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['user_id'] = current_user["id"]
    await db.disenos.insert_one(doc)
    return diseno_obj

@api_router.put("/disenos/{diseno_id}", response_model=Diseno)
async def update_diseno(diseno_id: str, diseno: DisenoCreate, current_user: dict = Depends(get_current_user)):
    diseno_dict = diseno.model_dump()
    
    result = await db.disenos.update_one(
        {"id": diseno_id, "user_id": current_user["id"]},
        {"$set": diseno_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Diseño no encontrado")
    
    updated = await db.disenos.find_one({"id": diseno_id}, {"_id": 0})
    return updated

@api_router.delete("/disenos/{diseno_id}")
async def delete_diseno(diseno_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.disenos.delete_one({"id": diseno_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Diseño no encontrado")
    return {"message": "Diseño eliminado"}

# ======================
# ENDPOINTS - Gastos Operativos (Protected)
# ======================
@api_router.get("/gastos", response_model=GastosOperativos)
async def get_gastos(current_user: dict = Depends(get_current_user)):
    gastos = await db.gastos_operativos.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not gastos:
        default_gastos = GastosOperativos()
        doc = default_gastos.model_dump()
        doc['user_id'] = current_user["id"]
        await db.gastos_operativos.insert_one(doc)
        return default_gastos
    return gastos

@api_router.put("/gastos", response_model=GastosOperativos)
async def update_gastos(gastos: GastosOperativosUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in gastos.model_dump().items() if v is not None}
    
    existing = await db.gastos_operativos.find_one({"user_id": current_user["id"]})
    if existing:
        await db.gastos_operativos.update_one({"user_id": current_user["id"]}, {"$set": update_data})
    else:
        default_gastos = GastosOperativos(**update_data)
        doc = default_gastos.model_dump()
        doc['user_id'] = current_user["id"]
        await db.gastos_operativos.insert_one(doc)
    
    updated = await db.gastos_operativos.find_one({"user_id": current_user["id"]}, {"_id": 0})
    return updated

# ======================
# ENDPOINTS - Configuración Ganancias (Protected)
# ======================
@api_router.get("/ganancias/config", response_model=ConfigGanancias)
async def get_config_ganancias(current_user: dict = Depends(get_current_user)):
    config = await db.config_ganancias.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not config:
        default_config = ConfigGanancias()
        doc = default_config.model_dump()
        doc['user_id'] = current_user["id"]
        await db.config_ganancias.insert_one(doc)
        return default_config
    return config

@api_router.put("/ganancias/config", response_model=ConfigGanancias)
async def update_config_ganancias(config: ConfigGananciasUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in config.model_dump().items() if v is not None}
    
    existing = await db.config_ganancias.find_one({"user_id": current_user["id"]})
    if existing:
        await db.config_ganancias.update_one({"user_id": current_user["id"]}, {"$set": update_data})
    else:
        default_config = ConfigGanancias(**update_data)
        doc = default_config.model_dump()
        doc['user_id'] = current_user["id"]
        await db.config_ganancias.insert_one(doc)
    
    updated = await db.config_ganancias.find_one({"user_id": current_user["id"]}, {"_id": 0})
    return updated

# ======================
# ENDPOINTS - Cálculo de Precio (Protected)
# ======================
@api_router.post("/calcular-precio", response_model=CalculoPrecioResponse)
async def calcular_precio(request: CalculoPrecioRequest, current_user: dict = Depends(get_current_user)):
    # Obtener estilo
    estilo = await db.estilos.find_one({"id": request.estilo_id, "user_id": current_user["id"]}, {"_id": 0})
    if not estilo:
        raise HTTPException(status_code=404, detail="Estilo no encontrado")
    
    # Obtener gastos y config
    gastos = await db.gastos_operativos.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not gastos:
        gastos = GastosOperativos().model_dump()
    
    config = await db.config_ganancias.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not config:
        config = ConfigGanancias().model_dump()
    
    # Calcular costo de productos del estilo
    costo_productos = 0.0
    for prod_uso in estilo.get('productos_usados', []):
        producto = await db.productos.find_one({"id": prod_uso['producto_id'], "user_id": current_user["id"]}, {"_id": 0})
        if producto:
            costo_productos += producto['costo_unitario'] * prod_uso['cantidad']
    
    # Calcular gasto operativo total
    gasto_total = (
        gastos.get('renta', 0) + gastos.get('luz', 0) + gastos.get('agua', 0) +
        gastos.get('internet', 0) + gastos.get('telefono', 0) + gastos.get('publicidad', 0) +
        gastos.get('mantenimiento', 0) + gastos.get('material_limpieza', 0) +
        gastos.get('plataformas_pago', 0) + gastos.get('impuestos', 0) + gastos.get('otros', 0)
    )
    
    # Prorratear por servicio
    servicios_mes = gastos.get('servicios_mes', 60) or 60
    costo_operativo_prorrateado = gasto_total / servicios_mes
    
    # Calcular costo de tiempo
    tiempo_base = estilo.get('tiempo_trabajo_minutos', 60)
    costo_hora = config.get('costo_hora_trabajo', 15)
    costo_tiempo = (tiempo_base / 60) * costo_hora
    
    # Calcular costo de diseños
    costo_disenos = 0.0
    tiempo_disenos = 0
    for diseno_id in request.disenos_ids:
        diseno = await db.disenos.find_one({"id": diseno_id, "user_id": current_user["id"]}, {"_id": 0})
        if diseno:
            costo_disenos += diseno.get('costo_adicional', 0)
            tiempo_disenos += diseno.get('tiempo_adicional_minutos', 0)
    
    # Tiempo total
    tiempo_total = tiempo_base + tiempo_disenos
    
    # Costo total
    costo_total = costo_productos + costo_operativo_prorrateado + costo_tiempo + costo_disenos
    
    # Margen de ganancia
    porcentaje = config.get('porcentaje_ganancia', 30) / 100
    margen_ganancia = costo_total * porcentaje
    
    # Precio recomendado
    precio_recomendado = costo_total + margen_ganancia
    
    # Precio mínimo rentable (con 10% de ganancia mínima)
    precio_minimo = costo_total * 1.10
    
    # Ganancia real
    ganancia_real = precio_recomendado - costo_total
    
    # Rentabilidad por hora
    horas_trabajo = tiempo_total / 60 if tiempo_total > 0 else 1
    rentabilidad_hora = ganancia_real / horas_trabajo
    
    # Alertas
    alertas = []
    if ganancia_real < 5:
        alertas.append("⚠️ La ganancia es muy baja. Considera ajustar precios.")
    if precio_recomendado < precio_minimo:
        alertas.append("❌ El precio está por debajo del mínimo rentable.")
    if rentabilidad_hora < costo_hora:
        alertas.append("📉 La rentabilidad por hora es menor al costo de tu tiempo.")
    if costo_productos > precio_recomendado * 0.5:
        alertas.append("📦 Los productos representan más del 50% del precio.")
    
    return CalculoPrecioResponse(
        estilo_nombre=estilo.get('nombre', ''),
        costo_productos=round(costo_productos, 2),
        costo_operativo_prorrateado=round(costo_operativo_prorrateado, 2),
        costo_tiempo_trabajo=round(costo_tiempo, 2),
        costo_disenos=round(costo_disenos, 2),
        costo_total=round(costo_total, 2),
        margen_ganancia=round(margen_ganancia, 2),
        precio_minimo_rentable=round(precio_minimo, 2),
        precio_recomendado=round(precio_recomendado, 2),
        ganancia_real=round(ganancia_real, 2),
        rentabilidad_hora=round(rentabilidad_hora, 2),
        tiempo_total_minutos=tiempo_total,
        alertas=alertas
    )

# ======================
# ENDPOINTS - Reporte (Protected)
# ======================
@api_router.get("/reporte", response_model=ReporteCompleto)
async def get_reporte(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    gastos = await db.gastos_operativos.find_one({"user_id": user_id}, {"_id": 0})
    if not gastos:
        gastos = GastosOperativos().model_dump()
    
    config = await db.config_ganancias.find_one({"user_id": user_id}, {"_id": 0})
    if not config:
        config = ConfigGanancias().model_dump()
    
    productos = await db.productos.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    estilos = await db.estilos.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    disenos = await db.disenos.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    # Calcular gasto total
    gasto_total = (
        gastos.get('renta', 0) + gastos.get('luz', 0) + gastos.get('agua', 0) +
        gastos.get('internet', 0) + gastos.get('telefono', 0) + gastos.get('publicidad', 0) +
        gastos.get('mantenimiento', 0) + gastos.get('material_limpieza', 0) +
        gastos.get('plataformas_pago', 0) + gastos.get('impuestos', 0) + gastos.get('otros', 0)
    )
    
    servicios_mes = gastos.get('servicios_mes', 60) or 60
    gasto_por_servicio = gasto_total / servicios_mes
    
    # Ranking de servicios por rentabilidad
    ranking = []
    for estilo in estilos:
        costo_productos = 0.0
        for prod_uso in estilo.get('productos_usados', []):
            producto = await db.productos.find_one({"id": prod_uso['producto_id'], "user_id": user_id}, {"_id": 0})
            if producto:
                costo_productos += producto.get('costo_unitario', 0) * prod_uso.get('cantidad', 0)
        
        tiempo = estilo.get('tiempo_trabajo_minutos', 60)
        costo_tiempo = (tiempo / 60) * config.get('costo_hora_trabajo', 15)
        costo_total = costo_productos + gasto_por_servicio + costo_tiempo
        
        porcentaje = config.get('porcentaje_ganancia', 30) / 100
        precio_recomendado = costo_total * (1 + porcentaje)
        ganancia = precio_recomendado - costo_total
        rentabilidad_hora = ganancia / (tiempo / 60) if tiempo > 0 else 0
        
        ranking.append({
            "nombre": estilo.get('nombre', ''),
            "costo_total": round(costo_total, 2),
            "precio_recomendado": round(precio_recomendado, 2),
            "ganancia": round(ganancia, 2),
            "rentabilidad_hora": round(rentabilidad_hora, 2),
            "tiempo_minutos": tiempo
        })
    
    # Ordenar por rentabilidad
    ranking.sort(key=lambda x: x['rentabilidad_hora'], reverse=True)
    
    # Rentabilidad mensual estimada
    rentabilidad_mensual = sum(s['ganancia'] for s in ranking) * (servicios_mes / len(ranking)) if ranking else 0
    
    return ReporteCompleto(
        fecha_generacion=datetime.now(timezone.utc).isoformat(),
        gastos_operativos=GastosOperativos(**gastos),
        config_ganancias=ConfigGanancias(**config),
        total_productos=len(productos),
        total_estilos=len(estilos),
        total_disenos=len(disenos),
        gasto_operativo_total=round(gasto_total, 2),
        gasto_por_servicio=round(gasto_por_servicio, 2),
        servicios_ranking=ranking,
        rentabilidad_mensual_estimada=round(rentabilidad_mensual, 2)
    )

# ======================
# SEED DATA (Protected)
# ======================
@api_router.post("/seed")
async def seed_data(current_user: dict = Depends(get_current_user)):
    """Crear datos de ejemplo para el usuario actual"""
    user_id = current_user["id"]
    
    # Productos de ejemplo
    productos_ejemplo = [
        {"nombre": "Acrílico", "tipo": "insumo", "precio_compra": 25.0, "cantidad_comprada": 50, "unidad": "gramos", "uso_por_servicio": 3},
        {"nombre": "Polygel", "tipo": "insumo", "precio_compra": 30.0, "cantidad_comprada": 30, "unidad": "gramos", "uso_por_servicio": 5},
        {"nombre": "Gel Semipermanente", "tipo": "insumo", "precio_compra": 15.0, "cantidad_comprada": 10, "unidad": "ml", "uso_por_servicio": 0.5},
        {"nombre": "Top Coat", "tipo": "insumo", "precio_compra": 12.0, "cantidad_comprada": 15, "unidad": "ml", "uso_por_servicio": 0.3},
        {"nombre": "Base Coat", "tipo": "insumo", "precio_compra": 10.0, "cantidad_comprada": 15, "unidad": "ml", "uso_por_servicio": 0.3},
        {"nombre": "Primer", "tipo": "insumo", "precio_compra": 8.0, "cantidad_comprada": 10, "unidad": "ml", "uso_por_servicio": 0.2},
        {"nombre": "Monómero", "tipo": "insumo", "precio_compra": 20.0, "cantidad_comprada": 100, "unidad": "ml", "uso_por_servicio": 5},
        {"nombre": "Tips", "tipo": "insumo", "precio_compra": 8.0, "cantidad_comprada": 500, "unidad": "unidades", "uso_por_servicio": 10},
        {"nombre": "Lámpara UV/LED", "tipo": "herramienta", "precio_compra": 80.0, "cantidad_comprada": 500, "unidad": "usos", "uso_por_servicio": 1},
        {"nombre": "Torno", "tipo": "herramienta", "precio_compra": 120.0, "cantidad_comprada": 1000, "unidad": "usos", "uso_por_servicio": 1},
    ]
    
    # Limpiar datos del usuario y crear productos
    await db.productos.delete_many({"user_id": user_id})
    created_productos = []
    for p in productos_ejemplo:
        producto = Producto(**p)
        producto.costo_unitario = p['precio_compra'] / p['cantidad_comprada'] * p['uso_por_servicio']
        doc = producto.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['user_id'] = user_id
        await db.productos.insert_one(doc)
        created_productos.append(producto)
    
    # Estilos de ejemplo
    await db.estilos.delete_many({"user_id": user_id})
    estilos_ejemplo = [
        {"nombre": "Uñas Naturales", "descripcion": "Limado y esmaltado básico", "productos_usados": [], "tiempo_trabajo_minutos": 30, "nivel_dificultad": "bajo"},
        {"nombre": "Acrílicas Cortas", "descripcion": "Extensión acrílica corta", "productos_usados": [{"producto_id": created_productos[0].id, "cantidad": 1}, {"producto_id": created_productos[6].id, "cantidad": 1}], "tiempo_trabajo_minutos": 90, "nivel_dificultad": "medio"},
        {"nombre": "Acrílicas Largas", "descripcion": "Extensión acrílica larga con forma", "productos_usados": [{"producto_id": created_productos[0].id, "cantidad": 1.5}, {"producto_id": created_productos[6].id, "cantidad": 1.5}], "tiempo_trabajo_minutos": 120, "nivel_dificultad": "alto"},
        {"nombre": "Polygel", "descripcion": "Extensión con polygel", "productos_usados": [{"producto_id": created_productos[1].id, "cantidad": 1}], "tiempo_trabajo_minutos": 75, "nivel_dificultad": "medio"},
        {"nombre": "Gel Semipermanente", "descripcion": "Esmaltado gel sin extensión", "productos_usados": [{"producto_id": created_productos[2].id, "cantidad": 1}, {"producto_id": created_productos[3].id, "cantidad": 1}, {"producto_id": created_productos[4].id, "cantidad": 1}], "tiempo_trabajo_minutos": 45, "nivel_dificultad": "bajo"},
    ]
    
    for e in estilos_ejemplo:
        costo = 0.0
        for pu in e['productos_usados']:
            prod = next((p for p in created_productos if p.id == pu['producto_id']), None)
            if prod:
                costo += prod.costo_unitario * pu['cantidad']
        estilo = Estilo(**e, costo_productos=costo)
        doc = estilo.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['user_id'] = user_id
        await db.estilos.insert_one(doc)
    
    # Diseños de ejemplo
    await db.disenos.delete_many({"user_id": user_id})
    disenos_ejemplo = [
        {"nombre": "French", "costo_adicional": 5.0, "tiempo_adicional_minutos": 15, "nivel_complejidad": "bajo"},
        {"nombre": "Baby Boomer", "costo_adicional": 8.0, "tiempo_adicional_minutos": 20, "nivel_complejidad": "medio"},
        {"nombre": "Encapsulado", "costo_adicional": 10.0, "tiempo_adicional_minutos": 25, "nivel_complejidad": "medio"},
        {"nombre": "Piedrería", "costo_adicional": 12.0, "tiempo_adicional_minutos": 20, "nivel_complejidad": "medio"},
        {"nombre": "Dibujos a Mano", "costo_adicional": 15.0, "tiempo_adicional_minutos": 30, "nivel_complejidad": "alto"},
        {"nombre": "3D", "costo_adicional": 20.0, "tiempo_adicional_minutos": 45, "nivel_complejidad": "alto"},
        {"nombre": "Glitter", "costo_adicional": 3.0, "tiempo_adicional_minutos": 5, "nivel_complejidad": "bajo"},
        {"nombre": "Foil", "costo_adicional": 5.0, "tiempo_adicional_minutos": 10, "nivel_complejidad": "bajo"},
    ]
    
    for d in disenos_ejemplo:
        diseno = Diseno(**d)
        doc = diseno.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['user_id'] = user_id
        await db.disenos.insert_one(doc)
    
    return {"message": "Datos de ejemplo creados exitosamente"}

# ======================
# ENDPOINTS - Clientes (Protected)
# ======================
@api_router.get("/clientes", response_model=List[Cliente])
async def get_clientes(current_user: dict = Depends(get_current_user)):
    clientes = await db.clientes.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    return clientes

@api_router.get("/clientes/{cliente_id}", response_model=Cliente)
async def get_cliente(cliente_id: str, current_user: dict = Depends(get_current_user)):
    cliente = await db.clientes.find_one({"id": cliente_id, "user_id": current_user["id"]}, {"_id": 0})
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente

@api_router.post("/clientes", response_model=Cliente)
async def create_cliente(cliente: ClienteCreate, current_user: dict = Depends(get_current_user)):
    count = await db.clientes.count_documents({"user_id": current_user["id"]})
    await check_plan_limit(current_user, "clientes", count)
    
    cliente_dict = cliente.model_dump()
    cliente_obj = Cliente(**cliente_dict)
    doc = cliente_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['user_id'] = current_user["id"]
    await db.clientes.insert_one(doc)
    return cliente_obj

@api_router.put("/clientes/{cliente_id}", response_model=Cliente)
async def update_cliente(cliente_id: str, cliente: ClienteCreate, current_user: dict = Depends(get_current_user)):
    cliente_dict = cliente.model_dump()
    result = await db.clientes.update_one(
        {"id": cliente_id, "user_id": current_user["id"]},
        {"$set": cliente_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    updated = await db.clientes.find_one({"id": cliente_id}, {"_id": 0})
    return updated

@api_router.delete("/clientes/{cliente_id}")
async def delete_cliente(cliente_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.clientes.delete_one({"id": cliente_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return {"message": "Cliente eliminado"}

# ======================
# ENDPOINTS - Citas (Protected)
# ======================
@api_router.get("/citas", response_model=List[Cita])
async def get_citas(fecha_desde: Optional[str] = None, fecha_hasta: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {"user_id": current_user["id"]}
    if fecha_desde:
        query["fecha"] = {"$gte": fecha_desde}
    if fecha_hasta:
        if "fecha" in query:
            query["fecha"]["$lte"] = fecha_hasta
        else:
            query["fecha"] = {"$lte": fecha_hasta}
    citas = await db.citas.find(query, {"_id": 0}).sort("fecha", 1).to_list(1000)
    return citas

@api_router.get("/citas/proximas")
async def get_citas_proximas(current_user: dict = Depends(get_current_user)):
    """Obtener citas de hoy y mañana para alertas"""
    hoy = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    manana = (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d")
    
    citas = await db.citas.find({
        "user_id": current_user["id"],
        "fecha": {"$in": [hoy, manana]},
        "estado": {"$in": ["pendiente", "confirmada"]}
    }, {"_id": 0}).sort([("fecha", 1), ("hora", 1)]).to_list(100)
    
    # Enrich with client and style info
    enriched = []
    for cita in citas:
        cliente = await db.clientes.find_one({"id": cita.get("cliente_id"), "user_id": current_user["id"]}, {"_id": 0})
        estilo = await db.estilos.find_one({"id": cita.get("estilo_id"), "user_id": current_user["id"]}, {"_id": 0})
        enriched.append({
            **cita,
            "cliente_nombre": cliente.get("nombre") if cliente else "Desconocido",
            "estilo_nombre": estilo.get("nombre") if estilo else "N/A"
        })
    return enriched

@api_router.post("/citas", response_model=Cita)
async def create_cita(cita: CitaCreate, current_user: dict = Depends(get_current_user)):
    cita_dict = cita.model_dump()
    cita_obj = Cita(**cita_dict)
    doc = cita_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['user_id'] = current_user["id"]
    await db.citas.insert_one(doc)
    return cita_obj

@api_router.put("/citas/{cita_id}", response_model=Cita)
async def update_cita(cita_id: str, cita: CitaUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in cita.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No hay datos para actualizar")
    
    result = await db.citas.update_one(
        {"id": cita_id, "user_id": current_user["id"]},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    updated = await db.citas.find_one({"id": cita_id}, {"_id": 0})
    return updated

@api_router.delete("/citas/{cita_id}")
async def delete_cita(cita_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.citas.delete_one({"id": cita_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    return {"message": "Cita eliminada"}

# ======================
# ENDPOINTS - Servicios Realizados (Protected)
# ======================
@api_router.get("/servicios", response_model=List[ServicioRealizado])
async def get_servicios(mes: Optional[str] = None, anio: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {"user_id": current_user["id"]}
    if mes and anio:
        prefix = f"{anio}-{mes.zfill(2)}"
        query["fecha"] = {"$regex": f"^{prefix}"}
    servicios = await db.servicios_realizados.find(query, {"_id": 0}).sort("fecha", -1).to_list(1000)
    return servicios

@api_router.post("/servicios", response_model=ServicioRealizado)
async def create_servicio(servicio: ServicioRealizadoCreate, current_user: dict = Depends(get_current_user)):
    servicio_dict = servicio.model_dump()
    servicio_obj = ServicioRealizado(**servicio_dict)
    servicio_obj.ganancia = servicio_obj.precio_cobrado - servicio_obj.costo_real
    
    doc = servicio_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['user_id'] = current_user["id"]
    await db.servicios_realizados.insert_one(doc)
    
    # Update client visit count
    await db.clientes.update_one(
        {"id": servicio.cliente_id, "user_id": current_user["id"]},
        {
            "$inc": {"total_visitas": 1},
            "$set": {"ultima_visita": servicio.fecha}
        }
    )
    
    return servicio_obj

@api_router.delete("/servicios/{servicio_id}")
async def delete_servicio(servicio_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.servicios_realizados.delete_one({"id": servicio_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return {"message": "Servicio eliminado"}

# ======================
# ENDPOINTS - Reportes Mensuales (Protected - Premium)
# ======================
@api_router.get("/reportes/mensual/{anio}/{mes}")
async def get_reporte_mensual(anio: str, mes: str, current_user: dict = Depends(get_current_user)):
    """Reporte mensual completo"""
    await check_premium_feature(current_user, "can_view_reports")
    
    user_id = current_user["id"]
    prefix = f"{anio}-{mes.zfill(2)}"
    
    # Get all services for the month
    servicios = await db.servicios_realizados.find(
        {"user_id": user_id, "fecha": {"$regex": f"^{prefix}"}},
        {"_id": 0}
    ).to_list(1000)
    
    # Get gastos
    gastos = await db.gastos_operativos.find_one({"user_id": user_id}, {"_id": 0})
    if not gastos:
        gastos = GastosOperativos().model_dump()
    
    gasto_total = (
        gastos.get('renta', 0) + gastos.get('luz', 0) + gastos.get('agua', 0) +
        gastos.get('internet', 0) + gastos.get('telefono', 0) + gastos.get('publicidad', 0) +
        gastos.get('mantenimiento', 0) + gastos.get('material_limpieza', 0) +
        gastos.get('plataformas_pago', 0) + gastos.get('impuestos', 0) + gastos.get('otros', 0)
    )
    
    # Calculate totals
    total_ingresos = sum(s.get('precio_cobrado', 0) for s in servicios)
    total_costos = sum(s.get('costo_real', 0) for s in servicios)
    total_ganancia = sum(s.get('ganancia', 0) for s in servicios)
    
    # Group by style
    estilos_stats = {}
    for s in servicios:
        estilo_id = s.get('estilo_id')
        if estilo_id not in estilos_stats:
            estilo = await db.estilos.find_one({"id": estilo_id, "user_id": user_id}, {"_id": 0})
            estilos_stats[estilo_id] = {
                "nombre": estilo.get('nombre') if estilo else "Desconocido",
                "cantidad": 0,
                "ingresos": 0,
                "costos": 0,
                "ganancia": 0
            }
        estilos_stats[estilo_id]["cantidad"] += 1
        estilos_stats[estilo_id]["ingresos"] += s.get('precio_cobrado', 0)
        estilos_stats[estilo_id]["costos"] += s.get('costo_real', 0)
        estilos_stats[estilo_id]["ganancia"] += s.get('ganancia', 0)
    
    # Daily breakdown
    dias = {}
    for s in servicios:
        dia = s.get('fecha')
        if dia not in dias:
            dias[dia] = {"ingresos": 0, "servicios": 0}
        dias[dia]["ingresos"] += s.get('precio_cobrado', 0)
        dias[dia]["servicios"] += 1
    
    # Get unique clients
    clientes_unicos = len(set(s.get('cliente_id') for s in servicios))
    
    return {
        "periodo": f"{anio}-{mes.zfill(2)}",
        "total_servicios": len(servicios),
        "total_ingresos": round(total_ingresos, 2),
        "total_costos": round(total_costos, 2),
        "total_ganancia": round(total_ganancia, 2),
        "gastos_operativos": round(gasto_total, 2),
        "ganancia_neta": round(total_ganancia - gasto_total, 2),
        "clientes_atendidos": clientes_unicos,
        "promedio_por_servicio": round(total_ingresos / len(servicios), 2) if servicios else 0,
        "estilos": list(estilos_stats.values()),
        "por_dia": [{"fecha": k, **v} for k, v in sorted(dias.items())]
    }

@api_router.get("/reportes/comparativa")
async def get_comparativa_mensual(current_user: dict = Depends(get_current_user)):
    """Comparativa de últimos 6 meses"""
    from datetime import timedelta
    user_id = current_user["id"]
    
    meses = []
    for i in range(6):
        fecha = datetime.now(timezone.utc) - timedelta(days=30 * i)
        anio = fecha.strftime("%Y")
        mes = fecha.strftime("%m")
        prefix = f"{anio}-{mes}"
        
        servicios = await db.servicios_realizados.find(
            {"user_id": user_id, "fecha": {"$regex": f"^{prefix}"}},
            {"_id": 0}
        ).to_list(1000)
        
        total_ingresos = sum(s.get('precio_cobrado', 0) for s in servicios)
        total_ganancia = sum(s.get('ganancia', 0) for s in servicios)
        
        meses.append({
            "periodo": prefix,
            "mes_nombre": fecha.strftime("%B"),
            "servicios": len(servicios),
            "ingresos": round(total_ingresos, 2),
            "ganancia": round(total_ganancia, 2)
        })
    
    return {"meses": list(reversed(meses))}

# ======================
# ENDPOINTS - Simulación (Protected)
# ======================
@api_router.post("/simulacion/mensual")
async def simular_ingresos_mensual(servicios_por_dia: int = 3, dias_trabajo: int = 22, current_user: dict = Depends(get_current_user)):
    """Simulación de ingresos mensuales"""
    user_id = current_user["id"]
    estilos = await db.estilos.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    config = await db.config_ganancias.find_one({"user_id": user_id}, {"_id": 0})
    if not config:
        config = ConfigGanancias().model_dump()
    
    gastos = await db.gastos_operativos.find_one({"user_id": user_id}, {"_id": 0})
    if not gastos:
        gastos = GastosOperativos().model_dump()
    
    gasto_total = (
        gastos.get('renta', 0) + gastos.get('luz', 0) + gastos.get('agua', 0) +
        gastos.get('internet', 0) + gastos.get('telefono', 0) + gastos.get('publicidad', 0) +
        gastos.get('mantenimiento', 0) + gastos.get('material_limpieza', 0) +
        gastos.get('plataformas_pago', 0) + gastos.get('impuestos', 0) + gastos.get('otros', 0)
    )
    
    servicios_mes = servicios_por_dia * dias_trabajo
    gasto_por_servicio = gasto_total / servicios_mes if servicios_mes > 0 else 0
    
    simulacion = []
    for estilo in estilos:
        costo_productos = estilo.get('costo_productos', 0)
        tiempo = estilo.get('tiempo_trabajo_minutos', 60)
        costo_tiempo = (tiempo / 60) * config.get('costo_hora_trabajo', 15)
        costo_total = costo_productos + gasto_por_servicio + costo_tiempo
        
        porcentaje = config.get('porcentaje_ganancia', 30) / 100
        precio = costo_total * (1 + porcentaje)
        ganancia = precio - costo_total
        
        # Simulate monthly if this was the only service
        ingresos_mes = precio * servicios_mes
        ganancia_mes = ganancia * servicios_mes
        
        simulacion.append({
            "estilo": estilo.get('nombre'),
            "precio_servicio": round(precio, 2),
            "ganancia_servicio": round(ganancia, 2),
            "servicios_mes": servicios_mes,
            "ingresos_estimados": round(ingresos_mes, 2),
            "ganancia_estimada": round(ganancia_mes - gasto_total, 2),
            "rentabilidad_hora": round(ganancia / (tiempo / 60), 2) if tiempo > 0 else 0
        })
    
    # Sort by profitability
    simulacion.sort(key=lambda x: x['rentabilidad_hora'], reverse=True)
    
    return {
        "parametros": {
            "servicios_por_dia": servicios_por_dia,
            "dias_trabajo": dias_trabajo,
            "servicios_mes": servicios_mes,
            "gastos_operativos": round(gasto_total, 2)
        },
        "simulacion": simulacion,
        "recomendacion": simulacion[0] if simulacion else None
    }

@api_router.get("/alertas")
async def get_alertas(current_user: dict = Depends(get_current_user)):
    """Obtener alertas del sistema"""
    user_id = current_user["id"]
    alertas = []
    
    # Check citas próximas
    from datetime import timedelta
    hoy = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    manana = (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d")
    
    citas_hoy = await db.citas.count_documents({
        "user_id": user_id,
        "fecha": hoy,
        "estado": {"$in": ["pendiente", "confirmada"]}
    })
    citas_manana = await db.citas.count_documents({
        "user_id": user_id,
        "fecha": manana,
        "estado": {"$in": ["pendiente", "confirmada"]}
    })
    
    if citas_hoy > 0:
        alertas.append({
            "tipo": "info",
            "mensaje": f"Tienes {citas_hoy} cita(s) para hoy",
            "accion": "Ver agenda"
        })
    if citas_manana > 0:
        alertas.append({
            "tipo": "info",
            "mensaje": f"Tienes {citas_manana} cita(s) para mañana",
            "accion": "Ver agenda"
        })
    
    # Check low profitability services
    estilos = await db.estilos.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    config = await db.config_ganancias.find_one({"user_id": user_id}, {"_id": 0})
    if not config:
        config = ConfigGanancias().model_dump()
    
    costo_hora = config.get('costo_hora_trabajo', 15)
    
    for estilo in estilos:
        tiempo = estilo.get('tiempo_trabajo_minutos', 60)
        costo_productos = estilo.get('costo_productos', 0)
        if tiempo > 0:
            # Simplified calculation
            ganancia_estimada = costo_productos * 0.3  # 30% margin
            rentabilidad_hora = (ganancia_estimada / (tiempo / 60))
            if rentabilidad_hora < costo_hora * 0.5:
                alertas.append({
                    "tipo": "warning",
                    "mensaje": f"'{estilo.get('nombre')}' tiene baja rentabilidad",
                    "accion": "Revisar precios"
                })
    
    return alertas

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Admin credentials - PERMANENT
ADMIN_EMAIL = "admin@nailcost.pro"
ADMIN_PASSWORD = "NailCost@Adm1n#2024Secure"

@app.on_event("startup")
async def startup_event():
    """Create or update permanent admin user on startup"""
    admin_user = await db.users.find_one({"email": ADMIN_EMAIL})
    
    if not admin_user:
        # Create admin
        admin_doc = {
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "password": get_password_hash(ADMIN_PASSWORD),
            "nombre": "Administrador",
            "nombre_negocio": "NailCost Pro",
            "telefono": "",
            "plan": "premium",
            "role": "admin",
            "user_type": "business",
            "is_disabled": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(admin_doc)
        logger.info(f"✅ Admin user created: {ADMIN_EMAIL}")
    else:
        # Update admin password to ensure it's always correct
        await db.users.update_one(
            {"email": ADMIN_EMAIL},
            {"$set": {
                "password": get_password_hash(ADMIN_PASSWORD),
                "role": "admin",
                "plan": "premium",
                "is_disabled": False
            }}
        )
        logger.info(f"✅ Admin user verified: {ADMIN_EMAIL}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
