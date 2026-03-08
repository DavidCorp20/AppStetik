# NailCost Pro - PRD

## Credenciales Admin (PERMANENTES)
| Email | Password |
|-------|----------|
| **admin@nailcost.pro** | **NailCost@Adm1n#2024Secure** |

---

## Precios de Suscripción
| Plan | Personal | Comercio |
|------|----------|----------|
| Básico | $5/mes | $15/mes |
| Premium | $10/mes | $20/mes |

**Trial:** 15 días gratis

---

## Última Actualización: 08 Marzo 2025

### ✅ AdminLayout Dedicado (COMPLETADO)
- ✅ Layout exclusivo para administradores con tema violeta oscuro
- ✅ Header con branding "NailCost ADMIN" y icono de escudo
- ✅ Navegación específica: Dashboard, Pendientes, Vencidos, Usuarios, Facturas, Analytics
- ✅ NO muestra navegación de Comercio (Cotizador, Inventario, Facturación)
- ✅ Redirección automática de admin a `/admin` desde `/`
- ✅ Footer dedicado "NailCost Admin Panel"

### ✅ Facturación Venezolana SENIAT (COMPLETADO)
- ✅ Configuración Fiscal con campos: Nombre Empresa, RIF, Dirección Fiscal
- ✅ Checkbox para activar IVA 16%
- ✅ Indicador "IVA 16% Activo" en el header de la página
- ✅ Cálculo automático en facturas: Subtotal → Base Imponible → IVA (16%) → TOTAL
- ✅ Campos de cliente: RIF/CI, Dirección Fiscal
- ✅ Tab "Reportes Fiscales" para generar reportes mensuales
- ✅ Reporte mensual con desglose de IVA para declaraciones
- ✅ Persistencia de configuración en localStorage

---

## Funcionalidades Anteriores ✅

### Login Profesional
- ✅ Diseño split-screen: branding + formulario
- ✅ Panel izquierdo oscuro con features
- ✅ Badges "Emprendedoras" y "Salones"

### Registro Profesional (MEJORADO)
- ✅ Split-screen con beneficios y testimonial
- ✅ Selector de tipo con precios claros ($5 vs $15)
- ✅ Badge "POPULAR" para Salón/Negocio
- ✅ Features listados por tipo (Contabilidad, Nómina, Inventario, etc.)
- ✅ Mensaje de activación pendiente

### Panel Admin Especializado (MEJORADO)
- ✅ **Diseño oscuro profesional**
- ✅ **Dashboard** con stats: Ingresos, Por Activar, Por Cobrar, Total Usuarios
- ✅ **Gráficos**: Ingresos por Plan (Pie), Estado de Suscripciones
- ✅ **6 secciones**:
  - Dashboard (vista general)
  - Pendientes (activación con 1 click)
  - Vencidos (registrar pago)
  - Usuarios (gestión activos)
  - Facturas (cobro con 1 click)
  - **Analytics (NUEVO)**: Ingresos/Gastos/Servicios/Clientes por usuario
- ✅ **Acciones rápidas** en dashboard
- ✅ Sin funciones de usuario regular (especializado en admin)

### Gestión de Empleados (MEJORADO)
- ✅ **3 tabs**: Equipo, Rendimiento, Nómina
- ✅ **Tipos de contrato**: Solo Comisión, Salario Fijo, Mixto
- ✅ **Campos nuevos**: Salario base, Horario, Fecha ingreso
- ✅ **Rendimiento**: Gráficos de servicios/empleado, Top performers
- ✅ **Nómina**: Cálculo automático salario + comisiones
- ✅ **Distribución por especialidad** (gráfico pie)

### Sistema de Bloqueo por Pago
- ✅ Trial vence → Usuario bloqueado
- ✅ Suscripción vence → Bloqueo automático
- ✅ Mensaje claro para el usuario
- ✅ Admin registra pago → Activo nuevamente

---

## Guía de Lanzamiento
Ver archivo: `/app/GUIA_LANZAMIENTO.md`

**Pasos principales:**
1. Configurar dominio personalizado
2. Variables de producción (.env)
3. Seguridad (JWT_SECRET, CORS)
4. Marketing inicial
5. Cobro manual o Stripe (futuro)

---

## Base de Datos: MongoDB Atlas ✅
```
mongodb+srv://arenasdavid1_db_user:***@cluster0.s2mz4tv.mongodb.net/nailcost_pro
```

---

## API Endpoints

### Admin
```
GET  /api/admin/subscriptions    - Lista con días restantes, ingresos/gastos
POST /api/admin/users/{id}/activate
POST /api/admin/users/{id}/subscription
POST /api/admin/users/{id}/generate-invoice
GET  /api/admin/invoices
PUT  /api/admin/invoices/{id}/status
```

### Empleados
```
GET/POST/PUT/DELETE /api/empleados
```

### Reportes
```
GET /api/reportes/financiero
GET /api/reportes/estado-empresa
```

---

## Backlog

### Para monetizar automático
- [ ] Integrar Stripe
- [ ] Emails de recordatorio

### Mejoras pendientes
- [ ] Modo oscuro para usuarios
- [ ] PWA instalable
- [ ] Exportar reportes a Excel

---

## Changelog

### 8 Marzo 2026 (Sesión actual)
- ✅ Login profesional split-screen
- ✅ Registro profesional con testimonial y precios
- ✅ Panel Admin especializado con Analytics
- ✅ Seguimiento de Ingresos/Gastos por usuario
- ✅ Gestión de Empleados con Nómina y Rendimiento
- ✅ Tipos de contrato (comisión/fijo/mixto)
- ✅ Guía de lanzamiento completa

### Anteriores
- Sistema de facturación
- Control de inventario
- Reportes financieros
- Notificaciones push
- MongoDB Atlas conectado
