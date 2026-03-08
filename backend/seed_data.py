"""
Seed Data Script for NailCost Pro
Creates test users with complete data for testing purposes
"""
import asyncio
import uuid
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from pathlib import Path
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Test Users Configuration
TEST_USERS = [
    {
        "email": "maria.personal@test.com",
        "password": "Test123!",
        "nombre": "María García",
        "nombre_negocio": "",
        "telefono": "0412-1234567",
        "user_type": "personal",
        "plan": "free",
    },
    {
        "email": "laura.premium@test.com",
        "password": "Test123!",
        "nombre": "Laura Rodríguez",
        "nombre_negocio": "",
        "telefono": "0414-2345678",
        "user_type": "personal",
        "plan": "premium",
    },
    {
        "email": "glamour.salon@test.com",
        "password": "Test123!",
        "nombre": "Ana Martínez",
        "nombre_negocio": "Glamour Nails Spa",
        "telefono": "0212-5551234",
        "user_type": "business",
        "plan": "free",
    },
    {
        "email": "elite.nails@test.com",
        "password": "Test123!",
        "nombre": "Carmen López",
        "nombre_negocio": "Elite Nails Studio",
        "telefono": "0212-5559876",
        "user_type": "business",
        "plan": "premium",
    },
    {
        "email": "bella.unas@test.com",
        "password": "Test123!",
        "nombre": "Sofia Hernández",
        "nombre_negocio": "Bella Uñas",
        "telefono": "0424-3456789",
        "user_type": "business",
        "plan": "premium",
    },
    {
        "email": "patricia.indie@test.com",
        "password": "Test123!",
        "nombre": "Patricia Díaz",
        "nombre_negocio": "",
        "telefono": "0416-4567890",
        "user_type": "personal",
        "plan": "free",
    },
]

# Sample Products
SAMPLE_PRODUCTOS = [
    {"nombre": "Esmalte Gel Base", "tipo": "insumo", "precio_compra": 15.0, "cantidad_comprada": 30, "unidad": "ml", "uso_por_servicio": 2},
    {"nombre": "Esmalte Gel Color Rojo", "tipo": "insumo", "precio_compra": 12.0, "cantidad_comprada": 15, "unidad": "ml", "uso_por_servicio": 1.5},
    {"nombre": "Esmalte Gel Color Rosa", "tipo": "insumo", "precio_compra": 12.0, "cantidad_comprada": 15, "unidad": "ml", "uso_por_servicio": 1.5},
    {"nombre": "Esmalte Gel Color Nude", "tipo": "insumo", "precio_compra": 12.0, "cantidad_comprada": 15, "unidad": "ml", "uso_por_servicio": 1.5},
    {"nombre": "Top Coat Brillante", "tipo": "insumo", "precio_compra": 18.0, "cantidad_comprada": 30, "unidad": "ml", "uso_por_servicio": 2},
    {"nombre": "Acetona Pura", "tipo": "insumo", "precio_compra": 8.0, "cantidad_comprada": 500, "unidad": "ml", "uso_por_servicio": 10},
    {"nombre": "Primer Ácido", "tipo": "insumo", "precio_compra": 10.0, "cantidad_comprada": 30, "unidad": "ml", "uso_por_servicio": 1},
    {"nombre": "Acrílico Polvo Blanco", "tipo": "insumo", "precio_compra": 25.0, "cantidad_comprada": 100, "unidad": "gr", "uso_por_servicio": 5},
    {"nombre": "Acrílico Polvo Rosa", "tipo": "insumo", "precio_compra": 25.0, "cantidad_comprada": 100, "unidad": "gr", "uso_por_servicio": 5},
    {"nombre": "Monómero Líquido", "tipo": "insumo", "precio_compra": 20.0, "cantidad_comprada": 120, "unidad": "ml", "uso_por_servicio": 8},
    {"nombre": "Lima 100/180", "tipo": "herramienta", "precio_compra": 2.0, "cantidad_comprada": 50, "unidad": "unidades", "uso_por_servicio": 0.1},
    {"nombre": "Buffer Pulidor", "tipo": "herramienta", "precio_compra": 3.0, "cantidad_comprada": 30, "unidad": "unidades", "uso_por_servicio": 0.1},
    {"nombre": "Pincel Acrílico #8", "tipo": "herramienta", "precio_compra": 15.0, "cantidad_comprada": 1, "unidad": "unidades", "uso_por_servicio": 0.01},
    {"nombre": "Decoraciones Strass", "tipo": "insumo", "precio_compra": 5.0, "cantidad_comprada": 500, "unidad": "unidades", "uso_por_servicio": 10},
    {"nombre": "Foil Dorado", "tipo": "insumo", "precio_compra": 8.0, "cantidad_comprada": 100, "unidad": "cm", "uso_por_servicio": 5},
]

# Sample Styles
SAMPLE_ESTILOS = [
    {"nombre": "Manicure Básico", "descripcion": "Limpieza, corte y esmaltado tradicional", "tiempo_trabajo_minutos": 45, "nivel_dificultad": "bajo"},
    {"nombre": "Manicure Gel", "descripcion": "Esmaltado semipermanente con lámpara UV", "tiempo_trabajo_minutos": 60, "nivel_dificultad": "medio"},
    {"nombre": "Uñas Acrílicas Básicas", "descripcion": "Extensión con acrílico, largo natural", "tiempo_trabajo_minutos": 90, "nivel_dificultad": "medio"},
    {"nombre": "Uñas Acrílicas Esculpidas", "descripcion": "Esculpido con tips o molde, acabado perfecto", "tiempo_trabajo_minutos": 120, "nivel_dificultad": "alto"},
    {"nombre": "Uñas de Gel Builder", "descripcion": "Construcción con gel, naturales", "tiempo_trabajo_minutos": 90, "nivel_dificultad": "medio"},
    {"nombre": "Press On Personalizadas", "descripcion": "Uñas prefabricadas personalizadas", "tiempo_trabajo_minutos": 30, "nivel_dificultad": "bajo"},
    {"nombre": "Pedicure Spa", "descripcion": "Tratamiento completo de pies", "tiempo_trabajo_minutos": 75, "nivel_dificultad": "bajo"},
    {"nombre": "Retoque Acrílico", "descripcion": "Relleno de crecimiento", "tiempo_trabajo_minutos": 60, "nivel_dificultad": "medio"},
]

# Sample Designs
SAMPLE_DISENOS = [
    {"nombre": "Francés Clásico", "costo_adicional": 5.0, "tiempo_adicional_minutos": 15, "nivel_complejidad": "bajo"},
    {"nombre": "Francés Invertido", "costo_adicional": 7.0, "tiempo_adicional_minutos": 20, "nivel_complejidad": "medio"},
    {"nombre": "Degradado Ombré", "costo_adicional": 10.0, "tiempo_adicional_minutos": 25, "nivel_complejidad": "medio"},
    {"nombre": "Nail Art Flores", "costo_adicional": 15.0, "tiempo_adicional_minutos": 40, "nivel_complejidad": "alto"},
    {"nombre": "Strass y Piedras", "costo_adicional": 8.0, "tiempo_adicional_minutos": 15, "nivel_complejidad": "bajo"},
    {"nombre": "Efecto Mármol", "costo_adicional": 12.0, "tiempo_adicional_minutos": 30, "nivel_complejidad": "medio"},
    {"nombre": "Stamping", "costo_adicional": 5.0, "tiempo_adicional_minutos": 10, "nivel_complejidad": "bajo"},
    {"nombre": "Encapsulado Glitter", "costo_adicional": 10.0, "tiempo_adicional_minutos": 20, "nivel_complejidad": "medio"},
    {"nombre": "Chrome/Espejo", "costo_adicional": 12.0, "tiempo_adicional_minutos": 15, "nivel_complejidad": "medio"},
    {"nombre": "Diseño 3D", "costo_adicional": 20.0, "tiempo_adicional_minutos": 45, "nivel_complejidad": "alto"},
]

# Sample Clients
SAMPLE_CLIENTES = [
    {"nombre": "Andrea Pérez", "telefono": "0412-1111111", "email": "andrea@email.com", "notas": "Prefiere tonos nude"},
    {"nombre": "Beatriz Gómez", "telefono": "0414-2222222", "email": "beatriz@email.com", "notas": "Alérgica al acrílico"},
    {"nombre": "Carolina Silva", "telefono": "0424-3333333", "email": "carolina@email.com", "notas": "Cliente VIP"},
    {"nombre": "Diana Torres", "telefono": "0416-4444444", "email": "diana@email.com", "notas": "Siempre pide diseños elaborados"},
    {"nombre": "Elena Ruiz", "telefono": "0426-5555555", "email": "elena@email.com", "notas": "Prefiere citas los sábados"},
    {"nombre": "Fernanda Castro", "telefono": "0412-6666666", "email": "fernanda@email.com", "notas": "Pago siempre en efectivo"},
    {"nombre": "Gabriela Mendez", "telefono": "0414-7777777", "email": "gabriela@email.com", "notas": "Refiere muchas clientas"},
    {"nombre": "Helena Vargas", "telefono": "0424-8888888", "email": "helena@email.com", "notas": "Trabaja cerca, viene en horario de almuerzo"},
]

# Sample Employees (for business users)
SAMPLE_EMPLEADOS = [
    {"nombre": "Jessica Morales", "email": "jessica@salon.com", "telefono": "0412-9991111", "especialidad": "Acrílico", "comision_porcentaje": 40, "salario_base": 150, "tipo_contrato": "mixto"},
    {"nombre": "Karla Suárez", "email": "karla@salon.com", "telefono": "0414-9992222", "especialidad": "Gel", "comision_porcentaje": 35, "salario_base": 0, "tipo_contrato": "comision"},
    {"nombre": "Lucia Romero", "email": "lucia@salon.com", "telefono": "0424-9993333", "especialidad": "Nail Art", "comision_porcentaje": 45, "salario_base": 100, "tipo_contrato": "mixto"},
    {"nombre": "Monica Blanco", "email": "monica@salon.com", "telefono": "0416-9994444", "especialidad": "Pedicure", "comision_porcentaje": 30, "salario_base": 200, "tipo_contrato": "fijo"},
]


async def seed_database():
    """Main function to seed the database with test data"""
    print("=" * 60)
    print("🌱 SEEDING NAILCOST PRO DATABASE")
    print("=" * 60)
    
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    now = datetime.now(timezone.utc)
    
    # Create activity_logs and user_settings collections indexes
    print("\n📊 Creating indexes for tracking collections...")
    await db.activity_logs.create_index([("user_id", 1), ("created_at", -1)])
    await db.activity_logs.create_index([("action", 1)])
    await db.user_settings.create_index([("user_id", 1)], unique=True)
    print("✅ Indexes created")
    
    created_users = []
    
    for user_data in TEST_USERS:
        print(f"\n👤 Processing user: {user_data['email']}")
        
        # Check if user exists
        existing = await db.users.find_one({"email": user_data["email"]})
        if existing:
            print(f"   ⏭️  User already exists, updating data...")
            user_id = existing["id"]
        else:
            # Create user
            user_id = str(uuid.uuid4())
            trial_end = now + timedelta(days=15)
            
            user_doc = {
                "id": user_id,
                "email": user_data["email"],
                "password": pwd_context.hash(user_data["password"]),
                "nombre": user_data["nombre"],
                "nombre_negocio": user_data["nombre_negocio"],
                "telefono": user_data["telefono"],
                "plan": user_data["plan"],
                "role": "user",
                "user_type": user_data["user_type"],
                "account_status": "active",
                "trial_ends_at": trial_end.isoformat(),
                "subscription_starts_at": now.isoformat() if user_data["plan"] == "premium" else None,
                "subscription_ends_at": (now + timedelta(days=30)).isoformat() if user_data["plan"] == "premium" else None,
                "created_at": (now - timedelta(days=random.randint(5, 30))).isoformat(),
                "last_login": (now - timedelta(hours=random.randint(1, 72))).isoformat(),
            }
            await db.users.insert_one(user_doc)
            print(f"   ✅ User created: {user_id}")
        
        created_users.append({"id": user_id, **user_data})
        
        # Create user_settings
        await db.user_settings.update_one(
            {"user_id": user_id},
            {"$set": {
                "user_id": user_id,
                "theme": "light",
                "currency": "USD",
                "timezone": "America/Caracas",
                "notifications_enabled": True,
                "email_notifications": True,
                "default_profit_margin": random.randint(25, 45),
                "fiscal_config": {
                    "rif": f"V-{random.randint(10000000, 30000000)}-{random.randint(0,9)}" if user_data["user_type"] == "business" else "",
                    "aplica_iva": user_data["user_type"] == "business",
                    "nombre_fiscal": user_data["nombre_negocio"] or user_data["nombre"],
                },
                "updated_at": now.isoformat(),
            }},
            upsert=True
        )
        print(f"   ✅ User settings created")
        
        # Clear existing data for this user
        await db.productos.delete_many({"user_id": user_id})
        await db.estilos.delete_many({"user_id": user_id})
        await db.disenos.delete_many({"user_id": user_id})
        await db.clientes.delete_many({"user_id": user_id})
        await db.citas.delete_many({"user_id": user_id})
        await db.facturas.delete_many({"user_id": user_id})
        await db.historial_calculos.delete_many({"user_id": user_id})
        if user_data["user_type"] == "business":
            await db.empleados.delete_many({"user_id": user_id})
        
        # Create Products (random selection)
        num_productos = random.randint(6, len(SAMPLE_PRODUCTOS))
        productos = random.sample(SAMPLE_PRODUCTOS, num_productos)
        producto_ids = []
        for p in productos:
            prod_id = str(uuid.uuid4())
            costo_unitario = p["precio_compra"] / p["cantidad_comprada"] * p["uso_por_servicio"] if p["cantidad_comprada"] > 0 else 0
            await db.productos.insert_one({
                "id": prod_id,
                "user_id": user_id,
                **p,
                "costo_unitario": costo_unitario,
                "cantidad_disponible": p["cantidad_comprada"],
                "stock_minimo": random.randint(3, 10),
                "created_at": (now - timedelta(days=random.randint(1, 20))).isoformat(),
            })
            producto_ids.append(prod_id)
        print(f"   ✅ Created {len(productos)} products")
        
        # Create Styles
        num_estilos = random.randint(4, len(SAMPLE_ESTILOS))
        estilos = random.sample(SAMPLE_ESTILOS, num_estilos)
        estilo_ids = []
        for e in estilos:
            est_id = str(uuid.uuid4())
            costo_productos = random.uniform(5, 25)
            await db.estilos.insert_one({
                "id": est_id,
                "user_id": user_id,
                **e,
                "productos_usados": [{"producto_id": random.choice(producto_ids), "cantidad": random.uniform(0.5, 2)} for _ in range(random.randint(2, 4))],
                "costo_productos": costo_productos,
                "precio_sugerido": costo_productos * random.uniform(2.5, 4),
                "created_at": (now - timedelta(days=random.randint(1, 15))).isoformat(),
            })
            estilo_ids.append(est_id)
        print(f"   ✅ Created {len(estilos)} styles")
        
        # Create Designs
        num_disenos = random.randint(5, len(SAMPLE_DISENOS))
        disenos = random.sample(SAMPLE_DISENOS, num_disenos)
        diseno_ids = []
        for d in disenos:
            dis_id = str(uuid.uuid4())
            await db.disenos.insert_one({
                "id": dis_id,
                "user_id": user_id,
                **d,
                "created_at": (now - timedelta(days=random.randint(1, 15))).isoformat(),
            })
            diseno_ids.append(dis_id)
        print(f"   ✅ Created {len(disenos)} designs")
        
        # Create Clients
        num_clientes = random.randint(4, len(SAMPLE_CLIENTES))
        clientes = random.sample(SAMPLE_CLIENTES, num_clientes)
        cliente_ids = []
        for c in clientes:
            cli_id = str(uuid.uuid4())
            await db.clientes.insert_one({
                "id": cli_id,
                "user_id": user_id,
                **c,
                "total_visitas": random.randint(1, 15),
                "ultima_visita": (now - timedelta(days=random.randint(1, 30))).isoformat(),
                "created_at": (now - timedelta(days=random.randint(10, 60))).isoformat(),
            })
            cliente_ids.append(cli_id)
        print(f"   ✅ Created {len(clientes)} clients")
        
        # Create Appointments
        for i in range(random.randint(3, 8)):
            cita_fecha = now + timedelta(days=random.randint(-7, 14))
            estados = ["pendiente", "confirmada", "completada", "cancelada"]
            estado = random.choice(estados[:3]) if cita_fecha > now else random.choice(estados[2:])
            
            await db.citas.insert_one({
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "cliente_id": random.choice(cliente_ids),
                "fecha": cita_fecha.strftime("%Y-%m-%d"),
                "hora": f"{random.randint(9, 18):02d}:{random.choice(['00', '30'])}",
                "estilo_id": random.choice(estilo_ids),
                "disenos_ids": random.sample(diseno_ids, random.randint(0, 2)),
                "precio_estimado": random.uniform(25, 80),
                "estado": estado,
                "notas": random.choice(["", "Cliente frecuente", "Primera vez", "Referida por amiga"]),
                "created_at": (cita_fecha - timedelta(days=random.randint(1, 7))).isoformat(),
            })
        print(f"   ✅ Created appointments")
        
        # Create Invoices
        for i in range(random.randint(5, 15)):
            factura_fecha = now - timedelta(days=random.randint(0, 45))
            cliente = random.choice(clientes)
            subtotal = random.uniform(20, 100)
            descuento = random.choice([0, 0, 0, 5, 10])
            iva = (subtotal - descuento) * 0.16 if user_data["user_type"] == "business" else 0
            total = subtotal - descuento + iva
            
            await db.facturas.insert_one({
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "numero": 1000 + i,
                "numero_control": f"00-{1000 + i:06d}",
                "cliente_id": random.choice(cliente_ids),
                "cliente_nombre": cliente["nombre"],
                "cliente_telefono": cliente["telefono"],
                "cliente_email": cliente["email"],
                "cliente_rif": f"V-{random.randint(10000000, 30000000)}",
                "items": [
                    {"descripcion": random.choice(estilos)["nombre"], "cantidad": 1, "precio_unitario": subtotal * 0.7},
                    {"descripcion": random.choice(disenos)["nombre"], "cantidad": 1, "precio_unitario": subtotal * 0.3},
                ],
                "subtotal": subtotal,
                "descuento": descuento,
                "iva_monto": iva,
                "total": total,
                "metodo_pago": random.choice(["efectivo", "transferencia", "pago_movil", "zelle"]),
                "estado": random.choice(["pagada", "pagada", "pagada", "pendiente"]),
                "notas": "",
                "fecha": factura_fecha.isoformat(),
            })
        print(f"   ✅ Created invoices")
        
        # Create Calculation History
        for i in range(random.randint(8, 20)):
            estilo = random.choice(estilos)
            costo = random.uniform(15, 40)
            precio = costo * random.uniform(2, 3.5)
            
            await db.historial_calculos.insert_one({
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "estilo_id": random.choice(estilo_ids),
                "estilo_nombre": estilo["nombre"],
                "disenos_ids": random.sample(diseno_ids, random.randint(0, 2)),
                "disenos_nombres": [random.choice(disenos)["nombre"] for _ in range(random.randint(0, 2))],
                "precio_recomendado": precio,
                "costo_total": costo,
                "ganancia": precio - costo,
                "cliente_nombre": random.choice(["", random.choice(clientes)["nombre"]]),
                "notas": "",
                "created_at": (now - timedelta(days=random.randint(0, 30))).isoformat(),
            })
        print(f"   ✅ Created calculation history")
        
        # Create Employees (for business users only)
        if user_data["user_type"] == "business":
            num_empleados = random.randint(2, len(SAMPLE_EMPLEADOS))
            empleados = random.sample(SAMPLE_EMPLEADOS, num_empleados)
            for emp in empleados:
                await db.empleados.insert_one({
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    **emp,
                    "activo": True,
                    "fecha_ingreso": (now - timedelta(days=random.randint(30, 365))).isoformat(),
                    "servicios_mes": random.randint(20, 80),
                    "ingresos_mes": random.uniform(300, 1200),
                    "created_at": (now - timedelta(days=random.randint(30, 180))).isoformat(),
                })
            print(f"   ✅ Created {len(empleados)} employees")
        
        # Create Activity Logs
        actions = [
            "login", "create_product", "create_style", "create_client", 
            "create_appointment", "create_invoice", "calculate_price",
            "update_settings", "view_report"
        ]
        for _ in range(random.randint(15, 40)):
            log_date = now - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
            await db.activity_logs.insert_one({
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "action": random.choice(actions),
                "details": {},
                "ip_address": f"190.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}",
                "user_agent": "Mozilla/5.0",
                "created_at": log_date.isoformat(),
            })
        print(f"   ✅ Created activity logs")
    
    # Create Gastos Operativos for each user
    print("\n💰 Creating gastos operativos...")
    for user in created_users:
        await db.gastos_operativos.update_one(
            {"user_id": user["id"]},
            {"$set": {
                "user_id": user["id"],
                "renta": random.uniform(100, 400) if user["user_type"] == "business" else random.uniform(0, 100),
                "luz": random.uniform(20, 60),
                "agua": random.uniform(10, 30),
                "internet": random.uniform(20, 50),
                "telefono": random.uniform(15, 40),
                "publicidad": random.uniform(0, 100),
                "mantenimiento": random.uniform(20, 80),
                "material_limpieza": random.uniform(10, 30),
                "plataformas_pago": random.uniform(5, 20),
                "impuestos": random.uniform(0, 50),
                "otros": random.uniform(10, 50),
                "clientes_mes": random.randint(15, 60),
                "servicios_mes": random.randint(30, 120),
                "dias_trabajo": random.randint(20, 26),
            }},
            upsert=True
        )
    print("✅ Gastos operativos created")
    
    # Create Config Ganancias for each user
    print("\n📈 Creating config ganancias...")
    for user in created_users:
        await db.config_ganancias.update_one(
            {"user_id": user["id"]},
            {"$set": {
                "user_id": user["id"],
                "porcentaje_ganancia": random.uniform(25, 50),
                "meta_ingreso_mensual": random.uniform(800, 3000),
                "meta_diaria": random.uniform(40, 150),
                "sueldo_objetivo": random.uniform(500, 2000),
                "costo_hora_trabajo": random.uniform(8, 25),
            }},
            upsert=True
        )
    print("✅ Config ganancias created")
    
    # Summary
    print("\n" + "=" * 60)
    print("✅ DATABASE SEEDING COMPLETE!")
    print("=" * 60)
    print("\n📊 SUMMARY:")
    print(f"   Users created/updated: {len(TEST_USERS)}")
    
    # Count totals
    total_productos = await db.productos.count_documents({})
    total_estilos = await db.estilos.count_documents({})
    total_disenos = await db.disenos.count_documents({})
    total_clientes = await db.clientes.count_documents({})
    total_citas = await db.citas.count_documents({})
    total_facturas = await db.facturas.count_documents({})
    total_empleados = await db.empleados.count_documents({})
    total_logs = await db.activity_logs.count_documents({})
    
    print(f"   Products: {total_productos}")
    print(f"   Styles: {total_estilos}")
    print(f"   Designs: {total_disenos}")
    print(f"   Clients: {total_clientes}")
    print(f"   Appointments: {total_citas}")
    print(f"   Invoices: {total_facturas}")
    print(f"   Employees: {total_empleados}")
    print(f"   Activity Logs: {total_logs}")
    
    print("\n🔑 TEST CREDENTIALS:")
    for user in TEST_USERS:
        print(f"   {user['email']} / Test123! ({user['user_type']}/{user['plan']})")
    
    print("\n" + "=" * 60)
    
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_database())
