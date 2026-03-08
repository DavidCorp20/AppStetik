# NailCost Pro - PRD (Product Requirements Document)

## Problema Original
Calculadora Inteligente de Costos para Uñas - Sistema profesional de cálculo de costos y precios para servicios de uñas.

---

## 🔐 CREDENCIALES ADMIN (PERMANENTES)

| Rol | Email | Password |
|-----|-------|----------|
| **Admin** | admin@nailcost.pro | NailCost@Adm1n#2024Secure |

> ⚠️ Esta contraseña se restaura automáticamente cada vez que el servidor arranca

### Usuarios de Prueba
| Email | Password | Tipo |
|-------|----------|------|
| maria.personal@test.com | test123 | Personal |
| ana.premium@test.com | test123 | Personal Premium |
| salon.bella@test.com | test123 | Comercio |
| nails.elegante@test.com | test123 | Comercio Premium |

---

## Lo Implementado ✅

### Panel de Administración Mejorado (Nuevo - Mar 2026)
- ✅ **Dashboard de Ingresos Proyectados**
  - Muestra ingreso mensual/anual basado en suscriptores
  - Precios: Personal Básico $5, Premium $10 | Comercio Básico $15, Premium $20
  - Desglose por tipo de usuario
- ✅ **Gestión de Usuarios**
  - Blanquear contraseñas (genera temporal)
  - Habilitar/Deshabilitar cuentas
  - Cambiar tipo (Personal ↔ Comercio)
  - Cambiar plan (Básico ↔ Premium)
- ✅ **Estadísticas Avanzadas**
  - Usuarios totales, activos (30d), premium
  - Por tipo: personales, comercios
  - Deshabilitados
- ✅ **Filtros y Búsqueda**
  - Buscar por nombre, email, negocio
  - Filtrar: Todos, Personal, Comercio, Premium, Deshabilitados

### Notificaciones Push (Nuevo - Mar 2026)
- ✅ **Service Worker** para PWA
- ✅ **Banner de activación** diferenciado por tipo de usuario:
  - Persona: "¡No te pierdas nada! 💅" - rosa/amigable
  - Comercio: "¿Activar notificaciones?" - profesional/azul
- ✅ **Tipos de notificaciones**:
  - Persona: citas, metas, tips motivacionales
  - Comercio: recordatorios de citas, stock bajo, facturas pendientes
- ✅ **Hook useNotifications** para enviar notificaciones programáticas

### Sistema de Autenticación
- ✅ Registro con tipo de cuenta (Personal/Negocio)
- ✅ Login con rate limiting (5 intentos, bloqueo 5 min)
- ✅ **Verificación de cuenta deshabilitada** en login
- ✅ Recuperación de contraseña con token
- ✅ JWT con 30 días de expiración

### Sistema de Facturación
- ✅ Página `/facturacion` para usuarios Comercio
- ✅ Métodos de pago Venezuela: Efectivo, Transferencia, Pago Móvil, Tarjeta, Zelle
- ✅ Descuentos y notas
- ✅ Imprimir/Descargar factura como HTML

### Experiencia COMERCIO (Minimalista Profesional)
- ✅ Dashboard con KPIs, meta mensual, agenda del día
- ✅ Control de Inventario con movimientos
- ✅ Navegación con dropdowns organizados

### Experiencia PERSONA (Emprendedora)
- ✅ Dashboard rosa con ganancias y progress ring
- ✅ Gráfico "Tu semana", accesos rápidos
- ✅ Alertas inteligentes amigables

### Páginas Legales
- ✅ /terminos - Términos y Condiciones
- ✅ /privacidad - Política de Privacidad
- ✅ /recuperar-contrasena - Flujo de reset

---

## Configuración para Producción

### MongoDB Atlas
```
# backend/.env para producción
MONGO_URL="mongodb+srv://arenasdavid1_db_user:5iQXCEYpLSjHj5ov@cluster0.s2mz4tv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME="nailcost_pro"
JWT_SECRET="[genera una clave segura de 64+ caracteres]"
```

> ⚠️ **IMPORTANTE**: En MongoDB Atlas, debes agregar la IP del servidor de producción a la whitelist:
> 1. Ve a Network Access en Atlas
> 2. Agrega la IP o usa 0.0.0.0/0 para permitir todas (menos seguro)

---

## API Endpoints

### Admin (Nuevo)
```
GET  /api/admin/stats              - Estadísticas completas
GET  /api/admin/revenue            - Proyección de ingresos
POST /api/admin/users/{id}/reset-password  - Blanquear contraseña
POST /api/admin/users/{id}/toggle-status   - Habilitar/deshabilitar
PUT  /api/admin/users/{id}/type    - Cambiar tipo (personal/business)
PUT  /api/admin/users/{id}/plan    - Cambiar plan (free/premium)
```

### Facturación
```
GET  /api/facturas                 - Listar facturas
POST /api/facturas                 - Crear factura
PUT  /api/facturas/{id}/estado     - Cambiar estado
DELETE /api/facturas/{id}          - Eliminar
```

---

## Stack Tecnológico
- **Frontend:** React 19, Tailwind CSS, Shadcn/UI, Recharts
- **Backend:** FastAPI, Motor (MongoDB async), python-jose, passlib
- **Database:** MongoDB (local dev / Atlas producción)
- **PWA:** Service Worker, Web Push API

---

## Precios de Suscripción

| Plan | Personal | Comercio |
|------|----------|----------|
| **Básico** | $5/mes | $15/mes |
| **Premium** | $10/mes | $20/mes |

---

## Backlog

### P0 (Crítico para Lanzamiento)
- [ ] **Configurar IP en MongoDB Atlas** para producción
- [ ] **Integración Stripe** para cobro de suscripciones
- [ ] Envío real de emails (Resend/SendGrid)

### P1 (Alta Prioridad)
- [ ] Sistema de notificaciones por email
- [ ] Recordatorios automáticos de citas
- [ ] Exportar datos a Excel

### P2 (Media Prioridad)
- [ ] Reportes por empleado
- [ ] Modo oscuro
- [ ] Instalación PWA completa

### P3 (Baja Prioridad)
- [ ] Recordatorios SMS (Twilio)
- [ ] Multi-moneda
- [ ] Backup/restaurar datos

---

## Changelog

### 8 Marzo 2026
- ✅ **Panel Admin mejorado** con proyección de ingresos
- ✅ **Gestión completa de usuarios**: blanquear contraseñas, habilitar/deshabilitar, cambiar tipo/plan
- ✅ **Notificaciones Push** con Service Worker
- ✅ Banner de notificaciones diferenciado (Persona vs Comercio)
- ✅ Credenciales admin permanentes (se restauran automáticamente)
- ✅ Verificación de cuenta deshabilitada en login
- ✅ Configuración preparada para MongoDB Atlas

### 7 Marzo 2026
- ✅ Sistema de Facturación completo
- ✅ Métodos de pago Venezuela

### Diciembre 2025
- ✅ Dual UX: Persona y Comercio
- ✅ Control de Inventario
- ✅ Sistema de seguridad completo
