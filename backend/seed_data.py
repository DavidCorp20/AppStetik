"""
Seed data script with REAL Venezuelan market prices (2024-2025)
Prices in USD at official exchange rate
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone, timedelta
import uuid
import random

# Load environment
from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).parent / '.env')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# ================================
# REAL VENEZUELAN MARKET PRICES
# ================================

# Products with real Venezuelan prices in USD
PRODUCTOS_REALES = [
    # Esmaltes y Geles
    {"nombre": "Esmalte Semipermanente Masglo", "tipo": "insumo", "precio_compra": 8.50, "cantidad_comprada": 12, "unidad": "unidades", "uso_por_servicio": 0.5},
    {"nombre": "Esmalte Gel Vogue", "tipo": "insumo", "precio_compra": 6.00, "cantidad_comprada": 15, "unidad": "unidades", "uso_por_servicio": 0.5},
    {"nombre": "Base Coat UV/LED", "tipo": "insumo", "precio_compra": 12.00, "cantidad_comprada": 8, "unidad": "unidades", "uso_por_servicio": 0.3},
    {"nombre": "Top Coat Brillo Espejo", "tipo": "insumo", "precio_compra": 14.00, "cantidad_comprada": 8, "unidad": "unidades", "uso_por_servicio": 0.3},
    {"nombre": "Esmalte Tradicional Revlon", "tipo": "insumo", "precio_compra": 4.50, "cantidad_comprada": 20, "unidad": "unidades", "uso_por_servicio": 0.4},
    
    # Acrílicos y Polvos
    {"nombre": "Polvo Acrílico Rosado 56g", "tipo": "insumo", "precio_compra": 18.00, "cantidad_comprada": 5, "unidad": "unidades", "uso_por_servicio": 2.0},
    {"nombre": "Polvo Acrílico Transparente 56g", "tipo": "insumo", "precio_compra": 16.00, "cantidad_comprada": 5, "unidad": "unidades", "uso_por_servicio": 2.0},
    {"nombre": "Monómero Acrílico 120ml", "tipo": "insumo", "precio_compra": 12.00, "cantidad_comprada": 8, "unidad": "unidades", "uso_por_servicio": 5.0},
    {"nombre": "Polvo Cover Pink 28g", "tipo": "insumo", "precio_compra": 15.00, "cantidad_comprada": 6, "unidad": "unidades", "uso_por_servicio": 1.5},
    
    # Gel y Polygel
    {"nombre": "Gel Constructor UV 30g", "tipo": "insumo", "precio_compra": 22.00, "cantidad_comprada": 4, "unidad": "unidades", "uso_por_servicio": 3.0},
    {"nombre": "Polygel Tubo 30g", "tipo": "insumo", "precio_compra": 15.00, "cantidad_comprada": 6, "unidad": "unidades", "uso_por_servicio": 2.5},
    {"nombre": "Gel Spider Negro", "tipo": "insumo", "precio_compra": 8.00, "cantidad_comprada": 3, "unidad": "unidades", "uso_por_servicio": 0.2},
    
    # Tips y Moldes
    {"nombre": "Tips Almendra 500pcs", "tipo": "insumo", "precio_compra": 8.00, "cantidad_comprada": 3, "unidad": "cajas", "uso_por_servicio": 10.0},
    {"nombre": "Tips Coffin/Bailarina 500pcs", "tipo": "insumo", "precio_compra": 9.00, "cantidad_comprada": 3, "unidad": "cajas", "uso_por_servicio": 10.0},
    {"nombre": "Moldes Dual System 100pcs", "tipo": "insumo", "precio_compra": 12.00, "cantidad_comprada": 2, "unidad": "cajas", "uso_por_servicio": 10.0},
    {"nombre": "Formas de Papel 500pcs", "tipo": "insumo", "precio_compra": 6.00, "cantidad_comprada": 4, "unidad": "rollos", "uso_por_servicio": 10.0},
    
    # Decoración
    {"nombre": "Piedras Swarovski Mix 1440pcs", "tipo": "insumo", "precio_compra": 25.00, "cantidad_comprada": 2, "unidad": "cajas", "uso_por_servicio": 5.0},
    {"nombre": "Foil Dorado/Plata 10pcs", "tipo": "insumo", "precio_compra": 4.00, "cantidad_comprada": 10, "unidad": "paquetes", "uso_por_servicio": 1.0},
    {"nombre": "Glitter Holográfico Set 12", "tipo": "insumo", "precio_compra": 8.00, "cantidad_comprada": 3, "unidad": "sets", "uso_por_servicio": 0.3},
    {"nombre": "Stickers Uñas 3D Mix", "tipo": "insumo", "precio_compra": 3.00, "cantidad_comprada": 15, "unidad": "hojas", "uso_por_servicio": 1.0},
    {"nombre": "Cinta Striping Tape 10 colores", "tipo": "insumo", "precio_compra": 2.50, "cantidad_comprada": 5, "unidad": "sets", "uso_por_servicio": 0.2},
    
    # Herramientas
    {"nombre": "Lámpara UV/LED 120W", "tipo": "herramienta", "precio_compra": 45.00, "cantidad_comprada": 1, "unidad": "unidades", "uso_por_servicio": 0.01},
    {"nombre": "Torno Profesional 35000 RPM", "tipo": "herramienta", "precio_compra": 65.00, "cantidad_comprada": 1, "unidad": "unidades", "uso_por_servicio": 0.01},
    {"nombre": "Pincel Acrílico Kolinsky #8", "tipo": "herramienta", "precio_compra": 18.00, "cantidad_comprada": 2, "unidad": "unidades", "uso_por_servicio": 0.02},
    {"nombre": "Set Pinceles Nail Art 15pcs", "tipo": "herramienta", "precio_compra": 12.00, "cantidad_comprada": 2, "unidad": "sets", "uso_por_servicio": 0.01},
    {"nombre": "Lima 100/180 Recta 10pcs", "tipo": "insumo", "precio_compra": 4.00, "cantidad_comprada": 10, "unidad": "paquetes", "uso_por_servicio": 0.5},
    {"nombre": "Lima Banana 100/100 10pcs", "tipo": "insumo", "precio_compra": 5.00, "cantidad_comprada": 8, "unidad": "paquetes", "uso_por_servicio": 0.5},
    {"nombre": "Buffer Pulidor 4 caras", "tipo": "insumo", "precio_compra": 1.50, "cantidad_comprada": 20, "unidad": "unidades", "uso_por_servicio": 0.3},
    {"nombre": "Cortauñas Profesional", "tipo": "herramienta", "precio_compra": 8.00, "cantidad_comprada": 2, "unidad": "unidades", "uso_por_servicio": 0.01},
    {"nombre": "Alicate Cutícula Inox", "tipo": "herramienta", "precio_compra": 15.00, "cantidad_comprada": 2, "unidad": "unidades", "uso_por_servicio": 0.01},
    {"nombre": "Empujador Cutícula Doble", "tipo": "herramienta", "precio_compra": 3.00, "cantidad_comprada": 5, "unidad": "unidades", "uso_por_servicio": 0.02},
    
    # Preparación y Limpieza
    {"nombre": "Acetona 100% Pura 1L", "tipo": "insumo", "precio_compra": 5.00, "cantidad_comprada": 6, "unidad": "litros", "uso_por_servicio": 15.0},
    {"nombre": "Alcohol Isopropílico 1L", "tipo": "insumo", "precio_compra": 4.00, "cantidad_comprada": 6, "unidad": "litros", "uso_por_servicio": 10.0},
    {"nombre": "Primer Sin Ácido 15ml", "tipo": "insumo", "precio_compra": 8.00, "cantidad_comprada": 5, "unidad": "unidades", "uso_por_servicio": 0.5},
    {"nombre": "Deshidratador 15ml", "tipo": "insumo", "precio_compra": 6.00, "cantidad_comprada": 5, "unidad": "unidades", "uso_por_servicio": 0.5},
    {"nombre": "Removedor Gel/Semipermanente 500ml", "tipo": "insumo", "precio_compra": 7.00, "cantidad_comprada": 4, "unidad": "unidades", "uso_por_servicio": 20.0},
    {"nombre": "Algodón 500g", "tipo": "insumo", "precio_compra": 3.00, "cantidad_comprada": 10, "unidad": "paquetes", "uso_por_servicio": 5.0},
    {"nombre": "Toallas Desechables 100pcs", "tipo": "insumo", "precio_compra": 4.00, "cantidad_comprada": 5, "unidad": "paquetes", "uso_por_servicio": 2.0},
    
    # Cuidado
    {"nombre": "Aceite Cutícula 15ml", "tipo": "insumo", "precio_compra": 4.00, "cantidad_comprada": 10, "unidad": "unidades", "uso_por_servicio": 0.3},
    {"nombre": "Crema Hidratante Manos 250ml", "tipo": "insumo", "precio_compra": 6.00, "cantidad_comprada": 5, "unidad": "unidades", "uso_por_servicio": 2.0},
]

# Styles with real Venezuelan market prices
ESTILOS_REALES = [
    {"nombre": "Manicure Tradicional", "descripcion": "Limado, cutícula y esmaltado tradicional", "tiempo_trabajo_minutos": 30, "nivel_dificultad": "bajo", "precio_sugerido": 8.00},
    {"nombre": "Manicure Rusa", "descripcion": "Técnica rusa con torno, cutícula perfecta", "tiempo_trabajo_minutos": 45, "nivel_dificultad": "medio", "precio_sugerido": 12.00},
    {"nombre": "Semipermanente Básico", "descripcion": "Esmaltado semipermanente un color", "tiempo_trabajo_minutos": 45, "nivel_dificultad": "bajo", "precio_sugerido": 12.00},
    {"nombre": "Semipermanente con Diseño", "descripcion": "Semipermanente + nail art sencillo", "tiempo_trabajo_minutos": 60, "nivel_dificultad": "medio", "precio_sugerido": 18.00},
    {"nombre": "Esmaltado Gel Básico", "descripcion": "Gel polish un solo color", "tiempo_trabajo_minutos": 50, "nivel_dificultad": "bajo", "precio_sugerido": 15.00},
    {"nombre": "Uñas Acrílicas Naturales", "descripcion": "Extensión acrílica look natural", "tiempo_trabajo_minutos": 90, "nivel_dificultad": "medio", "precio_sugerido": 25.00},
    {"nombre": "Acrílico con Diseño Básico", "descripcion": "Extensión + diseño francés o degradado", "tiempo_trabajo_minutos": 120, "nivel_dificultad": "medio", "precio_sugerido": 35.00},
    {"nombre": "Acrílico Diseño Elaborado", "descripcion": "Acrílico con nail art avanzado", "tiempo_trabajo_minutos": 150, "nivel_dificultad": "alto", "precio_sugerido": 50.00},
    {"nombre": "Uñas Polygel", "descripcion": "Extensión con polygel natural", "tiempo_trabajo_minutos": 80, "nivel_dificultad": "medio", "precio_sugerido": 22.00},
    {"nombre": "Gel Esculpido", "descripcion": "Uñas esculpidas en gel puro", "tiempo_trabajo_minutos": 100, "nivel_dificultad": "alto", "precio_sugerido": 30.00},
    {"nombre": "Press-On Personalizadas", "descripcion": "Set de uñas postizas personalizadas", "tiempo_trabajo_minutos": 120, "nivel_dificultad": "medio", "precio_sugerido": 40.00},
    {"nombre": "Retoque Acrílico/Gel", "descripcion": "Mantenimiento de extensiones", "tiempo_trabajo_minutos": 60, "nivel_dificultad": "medio", "precio_sugerido": 18.00},
    {"nombre": "Retiro Completo", "descripcion": "Remoción de extensiones o semipermanente", "tiempo_trabajo_minutos": 30, "nivel_dificultad": "bajo", "precio_sugerido": 8.00},
    {"nombre": "Spa de Manos", "descripcion": "Tratamiento hidratante completo", "tiempo_trabajo_minutos": 40, "nivel_dificultad": "bajo", "precio_sugerido": 15.00},
    {"nombre": "Nail Art Premium", "descripcion": "Diseños elaborados 3D, encapsulado", "tiempo_trabajo_minutos": 180, "nivel_dificultad": "alto", "precio_sugerido": 60.00},
]

# Client names (Venezuelan)
CLIENTES_NOMBRES = [
    ("María", "González"), ("Ana", "Rodríguez"), ("Carmen", "Martínez"), ("Rosa", "Hernández"),
    ("Patricia", "López"), ("Luisa", "García"), ("Elena", "Pérez"), ("Sofía", "Díaz"),
    ("Isabella", "Morales"), ("Valentina", "Ramírez"), ("Gabriela", "Torres"), ("Daniela", "Flores"),
    ("Andrea", "Rivera"), ("Mariana", "Sánchez"), ("Victoria", "Vargas"), ("Carolina", "Castro"),
    ("Alejandra", "Mendoza"), ("Paula", "Gutiérrez"), ("Laura", "Rojas"), ("Camila", "Ortiz"),
]

# Employee names and specialties
EMPLEADOS_DATA = [
    {"nombre": "Adriana Paredes", "especialidad": "Acrílico y Diseño", "telefono": "0414-1234567", "porcentaje_comision": 40},
    {"nombre": "Karla Méndez", "especialidad": "Semipermanente", "telefono": "0424-2345678", "porcentaje_comision": 35},
    {"nombre": "Yessica Rondón", "especialidad": "Nail Art", "telefono": "0412-3456789", "porcentaje_comision": 45},
    {"nombre": "Mariangel Torres", "especialidad": "Manicure Rusa", "telefono": "0416-4567890", "porcentaje_comision": 35},
]

# Gastos operativos reales para negocio venezolano
GASTOS_NEGOCIO = [
    {"concepto": "Alquiler Local", "monto": 150.00, "tipo": "fijo", "frecuencia": "mensual"},
    {"concepto": "Electricidad", "monto": 25.00, "tipo": "fijo", "frecuencia": "mensual"},
    {"concepto": "Internet Fibra Óptica", "monto": 30.00, "tipo": "fijo", "frecuencia": "mensual"},
    {"concepto": "Agua", "monto": 10.00, "tipo": "fijo", "frecuencia": "mensual"},
    {"concepto": "Productos de Limpieza", "monto": 15.00, "tipo": "variable", "frecuencia": "mensual"},
    {"concepto": "Instagram Ads", "monto": 20.00, "tipo": "variable", "frecuencia": "mensual"},
]

GASTOS_PERSONA = [
    {"concepto": "Internet", "monto": 25.00, "tipo": "fijo", "frecuencia": "mensual"},
    {"concepto": "Transporte a domicilios", "monto": 30.00, "tipo": "variable", "frecuencia": "mensual"},
    {"concepto": "Publicidad Instagram", "monto": 10.00, "tipo": "variable", "frecuencia": "mensual"},
]

async def clear_database(db):
    """Clear all collections except admin user"""
    collections = ['productos', 'estilos', 'clientes', 'gastos', 'config_ganancias', 
                   'empleados', 'citas', 'facturas', 'movimientos_inventario', 
                   'operational_costs', 'platform_config']
    
    for col in collections:
        await db[col].delete_many({})
    
    # Delete non-admin users
    await db.users.delete_many({"role": {"$ne": "admin"}})
    print("✅ Base de datos limpiada")

async def create_users(db):
    """Create test users"""
    users = []
    
    # Business user - Elite Nails Studio
    business_user = {
        "id": str(uuid.uuid4()),
        "email": "elite.nails@test.com",
        "password": get_password_hash("Test123!"),
        "nombre": "Adriana Paredes",
        "nombre_negocio": "Elite Nails Studio",
        "telefono": "0414-8523697",
        "plan": "premium",
        "role": "user",
        "user_type": "business",
        "is_disabled": False,
        "subscription_status": "active",
        "subscription_start": (datetime.now(timezone.utc) - timedelta(days=45)).isoformat(),
        "subscription_end": (datetime.now(timezone.utc) + timedelta(days=320)).isoformat(),
        "created_at": (datetime.now(timezone.utc) - timedelta(days=60)).isoformat(),
    }
    users.append(business_user)
    
    # Personal user - Independent nail artist
    personal_user = {
        "id": str(uuid.uuid4()),
        "email": "maria.nails@test.com",
        "password": get_password_hash("Test123!"),
        "nombre": "María Fernanda López",
        "nombre_negocio": "Nails by María",
        "telefono": "0424-7891234",
        "plan": "free",
        "role": "user", 
        "user_type": "personal",
        "is_disabled": False,
        "subscription_status": "active",
        "subscription_start": (datetime.now(timezone.utc) - timedelta(days=10)).isoformat(),
        "subscription_end": (datetime.now(timezone.utc) + timedelta(days=5)).isoformat(),  # Trial ending soon
        "created_at": (datetime.now(timezone.utc) - timedelta(days=10)).isoformat(),
    }
    users.append(personal_user)
    
    # Second business - smaller salon
    business_user2 = {
        "id": str(uuid.uuid4()),
        "email": "glamour.spa@test.com",
        "password": get_password_hash("Test123!"),
        "nombre": "Rosa Martínez",
        "nombre_negocio": "Glamour Spa & Nails",
        "telefono": "0412-5556789",
        "plan": "free",
        "role": "user",
        "user_type": "business",
        "is_disabled": False,
        "subscription_status": "trial",
        "subscription_start": datetime.now(timezone.utc).isoformat(),
        "subscription_end": (datetime.now(timezone.utc) + timedelta(days=15)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    users.append(business_user2)
    
    await db.users.insert_many(users)
    print(f"✅ {len(users)} usuarios creados")
    return users

async def create_products(db, user_id, is_business=True):
    """Create products for a user with real Venezuelan prices"""
    products = []
    # Select a subset for personal user
    product_list = PRODUCTOS_REALES if is_business else PRODUCTOS_REALES[:20]
    
    for p in product_list:
        producto = {
            **p,
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "costo_unitario": round(p["precio_compra"] / p["cantidad_comprada"], 2),
            "cantidad_disponible": p["cantidad_comprada"],  # Stock = cantidad comprada inicialmente
            "stock_minimo": max(2, int(p["cantidad_comprada"] * 0.2)),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        products.append(producto)
    
    if products:
        await db.productos.insert_many(products)
    print(f"  📦 {len(products)} productos creados")
    return products

async def create_styles(db, user_id, products, is_business=True):
    """Create styles with product associations"""
    styles = []
    style_list = ESTILOS_REALES if is_business else ESTILOS_REALES[:8]
    
    for s in style_list:
        # Associate random products with each style
        productos_usados = []
        num_products = random.randint(2, 5)
        selected_products = random.sample(products, min(num_products, len(products)))
        
        costo_productos = 0
        for prod in selected_products:
            cantidad = round(random.uniform(0.5, 2.0), 2)
            productos_usados.append({
                "producto_id": prod["id"],
                "cantidad": cantidad
            })
            costo_productos += prod["costo_unitario"] * cantidad
        
        estilo = {
            **s,
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "productos_usados": productos_usados,
            "costo_productos": round(costo_productos, 2),
            "precio_sugerido": s["precio_sugerido"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        styles.append(estilo)
    
    if styles:
        await db.estilos.insert_many(styles)
    print(f"  💅 {len(styles)} estilos creados")
    return styles

async def create_clients(db, user_id, is_business=True):
    """Create clients with Venezuelan data"""
    clients = []
    num_clients = 15 if is_business else 8
    
    for i in range(num_clients):
        nombre, apellido = random.choice(CLIENTES_NOMBRES)
        cliente = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "nombre": f"{nombre} {apellido}",
            "telefono": f"04{random.choice(['12','14','16','24'])}-{random.randint(1000000, 9999999)}",
            "email": f"{nombre.lower()}.{apellido.lower()}{random.randint(1,99)}@gmail.com",
            "notas": random.choice(["", "Prefiere tonos nude", "Alérgica al acrílico", "Cliente VIP", "Pide muchos diseños"]),
            "ultima_visita": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))).isoformat(),
            "total_visitas": random.randint(1, 20),
            "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(30, 180))).isoformat()
        }
        clients.append(cliente)
    
    if clients:
        await db.clientes.insert_many(clients)
    print(f"  👥 {len(clients)} clientes creados")
    return clients

async def create_expenses(db, user_id, is_business=True):
    """Create realistic expenses"""
    expenses = []
    gastos_list = GASTOS_NEGOCIO if is_business else GASTOS_PERSONA
    
    for g in gastos_list:
        gasto = {
            **g,
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "fecha": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        expenses.append(gasto)
    
    if expenses:
        await db.gastos.insert_many(expenses)
    print(f"  💰 {len(expenses)} gastos creados")
    return expenses

async def create_employees(db, user_id):
    """Create employees for business user"""
    employees = []
    for emp in EMPLEADOS_DATA:
        empleado = {
            **emp,
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "activo": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        employees.append(empleado)
    
    if employees:
        await db.empleados.insert_many(employees)
    print(f"  👩‍💼 {len(employees)} empleados creados")
    return employees

async def create_appointments(db, user_id, clients, styles, employees=None):
    """Create realistic appointments"""
    appointments = []
    
    # Create appointments for the past week and next week
    for day_offset in range(-7, 8):
        date = datetime.now(timezone.utc) + timedelta(days=day_offset)
        num_appointments = random.randint(2, 6) if day_offset >= 0 else random.randint(1, 4)
        
        for _ in range(num_appointments):
            hora = f"{random.randint(9, 17):02d}:{random.choice(['00', '30'])}"
            cliente = random.choice(clients)
            estilo = random.choice(styles)
            
            cita = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "cliente_id": cliente["id"],
                "cliente_nombre": cliente["nombre"],
                "estilo_id": estilo["id"],
                "estilo_nombre": estilo["nombre"],
                "fecha": date.strftime("%Y-%m-%d"),
                "hora": hora,
                "duracion_minutos": estilo["tiempo_trabajo_minutos"],
                "precio": estilo["precio_sugerido"],
                "estado": "completada" if day_offset < 0 else random.choice(["confirmada", "pendiente"]),
                "empleado_id": employees[random.randint(0, len(employees)-1)]["id"] if employees else None,
                "notas": "",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            appointments.append(cita)
    
    if appointments:
        await db.citas.insert_many(appointments)
    print(f"  📅 {len(appointments)} citas creadas")
    return appointments

async def create_invoices(db, user_id, clients, styles):
    """Create realistic invoices"""
    invoices = []
    
    for i in range(random.randint(8, 15)):
        cliente = random.choice(clients)
        num_items = random.randint(1, 3)
        items = []
        subtotal = 0
        
        for _ in range(num_items):
            estilo = random.choice(styles)
            cantidad = 1
            items.append({
                "descripcion": estilo["nombre"],
                "cantidad": cantidad,
                "precio_unitario": estilo["precio_sugerido"],
                "total": estilo["precio_sugerido"] * cantidad
            })
            subtotal += estilo["precio_sugerido"] * cantidad
        
        iva = round(subtotal * 0.16, 2)
        total = round(subtotal + iva, 2)
        
        factura = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "invoice_number": f"FAC-{datetime.now().year}-{1000 + i}",
            "cliente_id": cliente["id"],
            "cliente_nombre": cliente["nombre"],
            "cliente_rif": f"V-{random.randint(10000000, 30000000)}",
            "items": items,
            "subtotal": subtotal,
            "iva_porcentaje": 16,
            "iva": iva,
            "total": total,
            "status": random.choice(["paid", "paid", "paid", "pending"]),
            "metodo_pago": random.choice(["efectivo", "pago_movil", "transferencia", "zelle"]),
            "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))).isoformat()
        }
        invoices.append(factura)
    
    if invoices:
        await db.facturas.insert_many(invoices)
    print(f"  🧾 {len(invoices)} facturas creadas")
    return invoices

async def create_config(db, user_id, is_business=True):
    """Create profit configuration"""
    config = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "costo_hora_trabajo": 8.0 if is_business else 5.0,  # USD/hora
        "margen_ganancia_deseado": 40,
        "meta_ingreso_mensual": 800 if is_business else 400,
        "moneda": "USD",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.config_ganancias.insert_one(config)
    print("  ⚙️ Configuración creada")
    return config

async def create_operational_costs(db):
    """Create operational costs for the platform"""
    costs = [
        {"nombre": "MongoDB Atlas M10", "categoria": "database", "costo_mensual": 57.00, "proveedor": "MongoDB", "notas": "Cluster compartido"},
        {"nombre": "Servidor DigitalOcean", "categoria": "hosting", "costo_mensual": 24.00, "proveedor": "DigitalOcean", "notas": "Droplet 4GB RAM"},
        {"nombre": "Dominio .com", "categoria": "domain", "costo_mensual": 1.50, "proveedor": "Namecheap", "notas": "$18/año"},
        {"nombre": "SSL Certificado", "categoria": "domain", "costo_mensual": 0.00, "proveedor": "Let's Encrypt", "notas": "Gratuito"},
        {"nombre": "Cloudflare Pro", "categoria": "hosting", "costo_mensual": 20.00, "proveedor": "Cloudflare", "notas": "CDN y protección"},
        {"nombre": "SendGrid Email", "categoria": "api", "costo_mensual": 15.00, "proveedor": "SendGrid", "notas": "50k emails/mes"},
        {"nombre": "Backup Storage", "categoria": "hosting", "costo_mensual": 5.00, "proveedor": "Backblaze B2", "notas": "Backups diarios"},
    ]
    
    for cost in costs:
        cost["id"] = str(uuid.uuid4())
        cost["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.operational_costs.insert_many(costs)
    print("✅ Costos operativos de plataforma creados")

async def create_platform_pricing(db):
    """Create platform pricing configuration"""
    pricing = {
        "type": "pricing",
        "personal_basic": 5.00,
        "personal_premium": 12.00,
        "business_basic": 15.00,
        "business_premium": 30.00,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.platform_config.insert_one(pricing)
    print("✅ Precios de plataforma configurados")

async def main():
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME', 'nailcost_pro')
    
    print(f"\n🔌 Conectando a MongoDB...")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print(f"📂 Base de datos: {db_name}")
    print("=" * 50)
    
    # Clear existing data
    await clear_database(db)
    
    # Create platform configuration
    await create_operational_costs(db)
    await create_platform_pricing(db)
    
    # Create users
    users = await create_users(db)
    
    # Setup each user
    for user in users:
        print(f"\n🔧 Configurando: {user['nombre_negocio']}")
        is_business = user['user_type'] == 'business'
        
        products = await create_products(db, user['id'], is_business)
        styles = await create_styles(db, user['id'], products, is_business)
        clients = await create_clients(db, user['id'], is_business)
        await create_expenses(db, user['id'], is_business)
        await create_config(db, user['id'], is_business)
        
        employees = None
        if is_business:
            employees = await create_employees(db, user['id'])
        
        await create_appointments(db, user['id'], clients, styles, employees)
        await create_invoices(db, user['id'], clients, styles)
    
    print("\n" + "=" * 50)
    print("✅ SEED DATA COMPLETADO")
    print("=" * 50)
    print("\n📋 CREDENCIALES DE PRUEBA:")
    print("─" * 40)
    print("👑 ADMIN:")
    print("   Email: admin@nailcost.pro")
    print("   Pass:  NailCost@Adm1n#2024Secure")
    print("")
    print("🏢 NEGOCIO (Elite Nails Studio):")
    print("   Email: elite.nails@test.com")
    print("   Pass:  Test123!")
    print("")
    print("👩 PERSONAL (Nails by María):")
    print("   Email: maria.nails@test.com")
    print("   Pass:  Test123!")
    print("")
    print("🏪 NEGOCIO 2 (Glamour Spa - Trial):")
    print("   Email: glamour.spa@test.com")
    print("   Pass:  Test123!")
    print("─" * 40)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
