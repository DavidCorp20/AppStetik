# NailCost Pro - PRD

## Credenciales Admin (PERMANENTES)
| Email | Password |
|-------|----------|
| **admin@nailcost.pro** | **NailCost@Adm1n#2024Secure** |

> Se restaura automáticamente cada vez que el servidor arranca

---

## Modelo de Negocio

### Precios de Suscripción
| Plan | Personal | Comercio |
|------|----------|----------|
| Básico | $5/mes | $15/mes |
| Premium | $10/mes | $20/mes |

### Trial: 15 días de prueba gratuita

---

## Funcionalidades Implementadas ✅

### Sistema de Activación de Usuarios (NUEVO)
- ✅ Registro con estado "pendiente" - requiere aprobación admin
- ✅ Login bloqueado hasta que admin active la cuenta
- ✅ Trial de 15 días automático al activar
- ✅ Mensajes claros al usuario sobre estado de cuenta

### Panel Admin Mejorado
- ✅ **3 Tabs**: Usuarios, Suscripciones, Facturas
- ✅ **Dashboard de ingresos** con proyección mensual/anual
- ✅ **Stats**: Pendientes, En Prueba, Activos, Expirados
- ✅ **Gestión de usuarios**:
  - Activar cuenta (inicia trial 15 días)
  - Configurar suscripción (meses + plan)
  - Generar factura de suscripción
  - Blanquear contraseña
  - Habilitar/deshabilitar cuenta
- ✅ **Control de suscripciones**:
  - Fecha inicio/fin de suscripción
  - Días restantes con alerta si < 5
  - Renovar suscripción
- ✅ **Facturas admin**:
  - Número de factura automático
  - Estados: Pendiente/Pagada/Cancelada
  - Total pendiente/cobrado

### Reportes Financieros (Comercio)
- ✅ **Estado de Resultados**:
  - Ingresos brutos, costos, utilidad bruta/neta
  - Margen bruto y neto
- ✅ **Dashboard de métricas**:
  - Ingresos del mes con tendencia
  - Servicios realizados
  - Clientes activos
  - Citas pendientes
  - Alertas de stock bajo
- ✅ **Ranking de servicios** por ganancia
- ✅ **Desglose de gastos** con gráfico de pie
- ✅ **Facturación por método de pago**

### Navegación Mejorada (Comercio)
- ✅ Header profesional estilo admin
- ✅ Dropdowns: Dashboard, Agenda, Facturación
- ✅ Grupos: Gestión, Servicios, Finanzas, Herramientas
- ✅ Reportes Financieros en menú Herramientas

### Notificaciones Push
- ✅ Service Worker para PWA
- ✅ Banner diferenciado (Persona rosa, Comercio azul)

---

## Base de Datos: MongoDB Atlas ✅
```
mongodb+srv://arenasdavid1_db_user:***@cluster0.s2mz4tv.mongodb.net/nailcost_pro
```

---

## API Endpoints Nuevos

### Suscripciones Admin
```
POST /api/admin/users/{id}/activate      - Activar cuenta + trial 15 días
POST /api/admin/users/{id}/subscription  - Configurar suscripción
GET  /api/admin/subscriptions            - Lista con días restantes
POST /api/admin/users/{id}/generate-invoice
GET  /api/admin/invoices
PUT  /api/admin/invoices/{id}/status
```

### Reportes Financieros
```
GET /api/reportes/financiero      - Estado de resultados
GET /api/reportes/estado-empresa  - Métricas generales
```

---

## Backlog

### Para monetizar
- [ ] Integrar Stripe para cobro automático de suscripciones
- [ ] Envío de emails reales (recordatorios de vencimiento)

### Mejoras UI/UX
- [ ] Modo oscuro
- [ ] PWA completa (instalable)

---

## Changelog

### 8 Marzo 2026
- ✅ Sistema de activación de usuarios (pendiente → activo)
- ✅ Trial de 15 días automático
- ✅ Panel admin con tabs (Usuarios/Suscripciones/Facturas)
- ✅ Control de fechas de suscripción
- ✅ Generación de facturas de suscripción admin
- ✅ Reportes financieros para comercio
- ✅ Navegación mejorada estilo admin para comercio
- ✅ MongoDB Atlas conectado en producción

### 7 Marzo 2026
- ✅ Sistema de Facturación completo
- ✅ Métodos de pago Venezuela
