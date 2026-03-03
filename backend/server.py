from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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
# ENDPOINTS - Productos
# ======================
@api_router.get("/productos", response_model=List[Producto])
async def get_productos():
    productos = await db.productos.find({}, {"_id": 0}).to_list(1000)
    return productos

@api_router.post("/productos", response_model=Producto)
async def create_producto(producto: ProductoCreate):
    producto_dict = producto.model_dump()
    producto_obj = Producto(**producto_dict)
    # Calcular costo unitario
    if producto_obj.cantidad_comprada > 0:
        producto_obj.costo_unitario = producto_obj.precio_compra / producto_obj.cantidad_comprada * producto_obj.uso_por_servicio
    
    doc = producto_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.productos.insert_one(doc)
    return producto_obj

@api_router.put("/productos/{producto_id}", response_model=Producto)
async def update_producto(producto_id: str, producto: ProductoCreate):
    producto_dict = producto.model_dump()
    # Calcular costo unitario
    costo_unitario = 0.0
    if producto_dict['cantidad_comprada'] > 0:
        costo_unitario = producto_dict['precio_compra'] / producto_dict['cantidad_comprada'] * producto_dict['uso_por_servicio']
    
    producto_dict['costo_unitario'] = costo_unitario
    
    result = await db.productos.update_one(
        {"id": producto_id},
        {"$set": producto_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    updated = await db.productos.find_one({"id": producto_id}, {"_id": 0})
    return updated

@api_router.delete("/productos/{producto_id}")
async def delete_producto(producto_id: str):
    result = await db.productos.delete_one({"id": producto_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {"message": "Producto eliminado"}

# ======================
# ENDPOINTS - Estilos
# ======================
@api_router.get("/estilos", response_model=List[Estilo])
async def get_estilos():
    estilos = await db.estilos.find({}, {"_id": 0}).to_list(1000)
    return estilos

@api_router.post("/estilos", response_model=Estilo)
async def create_estilo(estilo: EstiloCreate):
    estilo_dict = estilo.model_dump()
    estilo_obj = Estilo(**estilo_dict)
    
    # Calcular costo de productos
    costo_total = 0.0
    for prod_uso in estilo_obj.productos_usados:
        producto = await db.productos.find_one({"id": prod_uso.producto_id}, {"_id": 0})
        if producto:
            costo_total += producto['costo_unitario'] * prod_uso.cantidad
    estilo_obj.costo_productos = costo_total
    
    doc = estilo_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.estilos.insert_one(doc)
    return estilo_obj

@api_router.put("/estilos/{estilo_id}", response_model=Estilo)
async def update_estilo(estilo_id: str, estilo: EstiloCreate):
    estilo_dict = estilo.model_dump()
    
    # Recalcular costo de productos
    costo_total = 0.0
    for prod_uso in estilo_dict['productos_usados']:
        producto = await db.productos.find_one({"id": prod_uso['producto_id']}, {"_id": 0})
        if producto:
            costo_total += producto['costo_unitario'] * prod_uso['cantidad']
    estilo_dict['costo_productos'] = costo_total
    
    result = await db.estilos.update_one(
        {"id": estilo_id},
        {"$set": estilo_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Estilo no encontrado")
    
    updated = await db.estilos.find_one({"id": estilo_id}, {"_id": 0})
    return updated

@api_router.delete("/estilos/{estilo_id}")
async def delete_estilo(estilo_id: str):
    result = await db.estilos.delete_one({"id": estilo_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Estilo no encontrado")
    return {"message": "Estilo eliminado"}

# ======================
# ENDPOINTS - Diseños
# ======================
@api_router.get("/disenos", response_model=List[Diseno])
async def get_disenos():
    disenos = await db.disenos.find({}, {"_id": 0}).to_list(1000)
    return disenos

@api_router.post("/disenos", response_model=Diseno)
async def create_diseno(diseno: DisenoCreate):
    diseno_dict = diseno.model_dump()
    diseno_obj = Diseno(**diseno_dict)
    
    doc = diseno_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.disenos.insert_one(doc)
    return diseno_obj

@api_router.put("/disenos/{diseno_id}", response_model=Diseno)
async def update_diseno(diseno_id: str, diseno: DisenoCreate):
    diseno_dict = diseno.model_dump()
    
    result = await db.disenos.update_one(
        {"id": diseno_id},
        {"$set": diseno_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Diseño no encontrado")
    
    updated = await db.disenos.find_one({"id": diseno_id}, {"_id": 0})
    return updated

@api_router.delete("/disenos/{diseno_id}")
async def delete_diseno(diseno_id: str):
    result = await db.disenos.delete_one({"id": diseno_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Diseño no encontrado")
    return {"message": "Diseño eliminado"}

# ======================
# ENDPOINTS - Gastos Operativos
# ======================
@api_router.get("/gastos", response_model=GastosOperativos)
async def get_gastos():
    gastos = await db.gastos_operativos.find_one({}, {"_id": 0})
    if not gastos:
        # Crear documento por defecto
        default_gastos = GastosOperativos()
        await db.gastos_operativos.insert_one(default_gastos.model_dump())
        return default_gastos
    return gastos

@api_router.put("/gastos", response_model=GastosOperativos)
async def update_gastos(gastos: GastosOperativosUpdate):
    update_data = {k: v for k, v in gastos.model_dump().items() if v is not None}
    
    existing = await db.gastos_operativos.find_one({})
    if existing:
        await db.gastos_operativos.update_one({}, {"$set": update_data})
    else:
        default_gastos = GastosOperativos(**update_data)
        await db.gastos_operativos.insert_one(default_gastos.model_dump())
    
    updated = await db.gastos_operativos.find_one({}, {"_id": 0})
    return updated

# ======================
# ENDPOINTS - Configuración Ganancias
# ======================
@api_router.get("/ganancias/config", response_model=ConfigGanancias)
async def get_config_ganancias():
    config = await db.config_ganancias.find_one({}, {"_id": 0})
    if not config:
        default_config = ConfigGanancias()
        await db.config_ganancias.insert_one(default_config.model_dump())
        return default_config
    return config

@api_router.put("/ganancias/config", response_model=ConfigGanancias)
async def update_config_ganancias(config: ConfigGananciasUpdate):
    update_data = {k: v for k, v in config.model_dump().items() if v is not None}
    
    existing = await db.config_ganancias.find_one({})
    if existing:
        await db.config_ganancias.update_one({}, {"$set": update_data})
    else:
        default_config = ConfigGanancias(**update_data)
        await db.config_ganancias.insert_one(default_config.model_dump())
    
    updated = await db.config_ganancias.find_one({}, {"_id": 0})
    return updated

# ======================
# ENDPOINTS - Cálculo de Precio
# ======================
@api_router.post("/calcular-precio", response_model=CalculoPrecioResponse)
async def calcular_precio(request: CalculoPrecioRequest):
    # Obtener estilo
    estilo = await db.estilos.find_one({"id": request.estilo_id}, {"_id": 0})
    if not estilo:
        raise HTTPException(status_code=404, detail="Estilo no encontrado")
    
    # Obtener gastos y config
    gastos = await db.gastos_operativos.find_one({}, {"_id": 0})
    if not gastos:
        gastos = GastosOperativos().model_dump()
    
    config = await db.config_ganancias.find_one({}, {"_id": 0})
    if not config:
        config = ConfigGanancias().model_dump()
    
    # Calcular costo de productos del estilo
    costo_productos = 0.0
    for prod_uso in estilo.get('productos_usados', []):
        producto = await db.productos.find_one({"id": prod_uso['producto_id']}, {"_id": 0})
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
        diseno = await db.disenos.find_one({"id": diseno_id}, {"_id": 0})
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
# ENDPOINTS - Reporte
# ======================
@api_router.get("/reporte", response_model=ReporteCompleto)
async def get_reporte():
    gastos = await db.gastos_operativos.find_one({}, {"_id": 0})
    if not gastos:
        gastos = GastosOperativos().model_dump()
    
    config = await db.config_ganancias.find_one({}, {"_id": 0})
    if not config:
        config = ConfigGanancias().model_dump()
    
    productos = await db.productos.find({}, {"_id": 0}).to_list(1000)
    estilos = await db.estilos.find({}, {"_id": 0}).to_list(1000)
    disenos = await db.disenos.find({}, {"_id": 0}).to_list(1000)
    
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
            producto = await db.productos.find_one({"id": prod_uso['producto_id']}, {"_id": 0})
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
# SEED DATA
# ======================
@api_router.post("/seed")
async def seed_data():
    """Crear datos de ejemplo"""
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
    
    # Limpiar y crear productos
    await db.productos.delete_many({})
    created_productos = []
    for p in productos_ejemplo:
        producto = Producto(**p)
        producto.costo_unitario = p['precio_compra'] / p['cantidad_comprada'] * p['uso_por_servicio']
        doc = producto.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.productos.insert_one(doc)
        created_productos.append(producto)
    
    # Estilos de ejemplo
    await db.estilos.delete_many({})
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
        await db.estilos.insert_one(doc)
    
    # Diseños de ejemplo
    await db.disenos.delete_many({})
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
        await db.disenos.insert_one(doc)
    
    return {"message": "Datos de ejemplo creados exitosamente"}

# ======================
# ENDPOINTS - Clientes
# ======================
@api_router.get("/clientes", response_model=List[Cliente])
async def get_clientes():
    clientes = await db.clientes.find({}, {"_id": 0}).to_list(1000)
    return clientes

@api_router.get("/clientes/{cliente_id}", response_model=Cliente)
async def get_cliente(cliente_id: str):
    cliente = await db.clientes.find_one({"id": cliente_id}, {"_id": 0})
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente

@api_router.post("/clientes", response_model=Cliente)
async def create_cliente(cliente: ClienteCreate):
    cliente_dict = cliente.model_dump()
    cliente_obj = Cliente(**cliente_dict)
    doc = cliente_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.clientes.insert_one(doc)
    return cliente_obj

@api_router.put("/clientes/{cliente_id}", response_model=Cliente)
async def update_cliente(cliente_id: str, cliente: ClienteCreate):
    cliente_dict = cliente.model_dump()
    result = await db.clientes.update_one(
        {"id": cliente_id},
        {"$set": cliente_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    updated = await db.clientes.find_one({"id": cliente_id}, {"_id": 0})
    return updated

@api_router.delete("/clientes/{cliente_id}")
async def delete_cliente(cliente_id: str):
    result = await db.clientes.delete_one({"id": cliente_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return {"message": "Cliente eliminado"}

# ======================
# ENDPOINTS - Citas
# ======================
@api_router.get("/citas", response_model=List[Cita])
async def get_citas(fecha_desde: Optional[str] = None, fecha_hasta: Optional[str] = None):
    query = {}
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
async def get_citas_proximas():
    """Obtener citas de hoy y mañana para alertas"""
    from datetime import timedelta
    hoy = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    manana = (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d")
    
    citas = await db.citas.find({
        "fecha": {"$in": [hoy, manana]},
        "estado": {"$in": ["pendiente", "confirmada"]}
    }, {"_id": 0}).sort([("fecha", 1), ("hora", 1)]).to_list(100)
    
    # Enrich with client and style info
    enriched = []
    for cita in citas:
        cliente = await db.clientes.find_one({"id": cita.get("cliente_id")}, {"_id": 0})
        estilo = await db.estilos.find_one({"id": cita.get("estilo_id")}, {"_id": 0})
        enriched.append({
            **cita,
            "cliente_nombre": cliente.get("nombre") if cliente else "Desconocido",
            "estilo_nombre": estilo.get("nombre") if estilo else "N/A"
        })
    return enriched

@api_router.post("/citas", response_model=Cita)
async def create_cita(cita: CitaCreate):
    cita_dict = cita.model_dump()
    cita_obj = Cita(**cita_dict)
    doc = cita_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.citas.insert_one(doc)
    return cita_obj

@api_router.put("/citas/{cita_id}", response_model=Cita)
async def update_cita(cita_id: str, cita: CitaUpdate):
    update_data = {k: v for k, v in cita.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No hay datos para actualizar")
    
    result = await db.citas.update_one(
        {"id": cita_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    updated = await db.citas.find_one({"id": cita_id}, {"_id": 0})
    return updated

@api_router.delete("/citas/{cita_id}")
async def delete_cita(cita_id: str):
    result = await db.citas.delete_one({"id": cita_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    return {"message": "Cita eliminada"}

# ======================
# ENDPOINTS - Servicios Realizados
# ======================
@api_router.get("/servicios", response_model=List[ServicioRealizado])
async def get_servicios(mes: Optional[str] = None, anio: Optional[str] = None):
    query = {}
    if mes and anio:
        # Filter by month (fecha format: YYYY-MM-DD)
        prefix = f"{anio}-{mes.zfill(2)}"
        query["fecha"] = {"$regex": f"^{prefix}"}
    servicios = await db.servicios_realizados.find(query, {"_id": 0}).sort("fecha", -1).to_list(1000)
    return servicios

@api_router.post("/servicios", response_model=ServicioRealizado)
async def create_servicio(servicio: ServicioRealizadoCreate):
    servicio_dict = servicio.model_dump()
    servicio_obj = ServicioRealizado(**servicio_dict)
    servicio_obj.ganancia = servicio_obj.precio_cobrado - servicio_obj.costo_real
    
    doc = servicio_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.servicios_realizados.insert_one(doc)
    
    # Update client visit count
    await db.clientes.update_one(
        {"id": servicio.cliente_id},
        {
            "$inc": {"total_visitas": 1},
            "$set": {"ultima_visita": servicio.fecha}
        }
    )
    
    return servicio_obj

@api_router.delete("/servicios/{servicio_id}")
async def delete_servicio(servicio_id: str):
    result = await db.servicios_realizados.delete_one({"id": servicio_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return {"message": "Servicio eliminado"}

# ======================
# ENDPOINTS - Reportes Mensuales
# ======================
@api_router.get("/reportes/mensual/{anio}/{mes}")
async def get_reporte_mensual(anio: str, mes: str):
    """Reporte mensual completo"""
    prefix = f"{anio}-{mes.zfill(2)}"
    
    # Get all services for the month
    servicios = await db.servicios_realizados.find(
        {"fecha": {"$regex": f"^{prefix}"}},
        {"_id": 0}
    ).to_list(1000)
    
    # Get gastos
    gastos = await db.gastos_operativos.find_one({}, {"_id": 0})
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
            estilo = await db.estilos.find_one({"id": estilo_id}, {"_id": 0})
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
async def get_comparativa_mensual():
    """Comparativa de últimos 6 meses"""
    from datetime import timedelta
    
    meses = []
    for i in range(6):
        fecha = datetime.now(timezone.utc) - timedelta(days=30 * i)
        anio = fecha.strftime("%Y")
        mes = fecha.strftime("%m")
        prefix = f"{anio}-{mes}"
        
        servicios = await db.servicios_realizados.find(
            {"fecha": {"$regex": f"^{prefix}"}},
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
# ENDPOINTS - Simulación
# ======================
@api_router.post("/simulacion/mensual")
async def simular_ingresos_mensual(servicios_por_dia: int = 3, dias_trabajo: int = 22):
    """Simulación de ingresos mensuales"""
    estilos = await db.estilos.find({}, {"_id": 0}).to_list(100)
    config = await db.config_ganancias.find_one({}, {"_id": 0})
    if not config:
        config = ConfigGanancias().model_dump()
    
    gastos = await db.gastos_operativos.find_one({}, {"_id": 0})
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
async def get_alertas():
    """Obtener alertas del sistema"""
    alertas = []
    
    # Check citas próximas
    from datetime import timedelta
    hoy = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    manana = (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d")
    
    citas_hoy = await db.citas.count_documents({
        "fecha": hoy,
        "estado": {"$in": ["pendiente", "confirmada"]}
    })
    citas_manana = await db.citas.count_documents({
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
    estilos = await db.estilos.find({}, {"_id": 0}).to_list(100)
    config = await db.config_ganancias.find_one({}, {"_id": 0})
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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
