# NailCost Pro - PRD (Product Requirements Document)

## Problema Original
Calculadora Inteligente de Costos para Uñas - Sistema profesional de cálculo de costos y precios para servicios de uñas.

---

## Lo Implementado ✅

### Sistema de Autenticación
- ✅ Registro con tipo de cuenta (Personal/Negocio)
- ✅ Login con rate limiting (5 intentos, bloqueo 5 min)
- ✅ Recuperación de contraseña con token
- ✅ JWT con 30 días de expiración

### Sistema de Facturación (NUEVO - Dic 2025)
- ✅ Página `/facturacion` para usuarios Comercio
- ✅ Stats: Total facturas, Facturado (pagado), Pendientes, Mes actual
- ✅ Tabla de facturas con búsqueda y filtros
- ✅ Crear factura con cliente, items múltiples
- ✅ Métodos de pago Venezuela: Efectivo, Transferencia, Pago Móvil, Tarjeta, Zelle
- ✅ Descuentos y notas
- ✅ Cálculo automático de subtotal y total
- ✅ Cambio de estado (Pendiente/Pagada/Anulada)
- ✅ Imprimir factura (HTML con estilos profesionales)
- ✅ Descargar factura como HTML

### Experiencia COMERCIO (Minimalista Profesional)

**Dashboard:**
- ✅ Diseño minimalista gris/blanco (sin colores excesivos)
- ✅ KPIs simples: Ingresos, Gastos, Clientes, Inventario
- ✅ Barra de meta mensual con progreso
- ✅ Tabla de Agenda de Hoy profesional
- ✅ Ranking de Servicios Más Rentables
- ✅ Card de Resumen oscura (negro)
- ✅ Panel de Equipo y Stock en sidebar

**Control de Inventario:**
- ✅ Stats: Total productos, Stock normal, Stock bajo, Agotados
- ✅ Tabla de productos con estado de stock
- ✅ Indicador visual de nivel (Normal/Bajo/Crítico/Agotado)
- ✅ Botones de Entrada/Salida de stock
- ✅ Registro de movimientos de inventario
- ✅ Historial de movimientos
- ✅ Filtros por estado
- ✅ Exportar datos

**Navegación:**
- ✅ Header profesional con logo "NailCost BUSINESS"
- ✅ Menú: Dashboard, Agenda, Facturación (NUEVO)
- ✅ Dropdowns: Gestión (Clientes, Empleados, Inventario), Servicios, Finanzas
- ✅ Herramientas: Cotizar, Reportes, Simulación

### Experiencia PERSONA (Emprendedora)

**Dashboard:**
- ✅ Diseño rosa profesional pero amigable
- ✅ Saludo personalizado con hora del día
- ✅ Card principal con ganancia del mes + Progress Ring
- ✅ "Tu ganancia real después de gastos" visible
- ✅ Margen de ganancia en porcentaje
- ✅ Gráfico "Tu semana" (barras últimos 7 días)
- ✅ Acceso rápido: Calcular, Clientes, Agenda, Gastos

**Reportes Visuales:**
- ✅ "Cobras en promedio" - Por servicio
- ✅ "Gastos del mes" - Total operativos
- ✅ Cards de Insights con emojis y explicaciones simples
- ✅ Actividad reciente con precios

**Alertas Inteligentes:**
- ✅ Stock bajo de productos
- ✅ Citas del día
- ✅ Progreso hacia meta mensual
- ✅ Mensajes amigables

**Navegación:**
- ✅ Bottom bar fija: Inicio, Clientes, Calcular, Agenda, Historial
- ✅ Botón central destacado (Calcular)
- ✅ Menú desplegable con más opciones

### Páginas Legales
- ✅ /terminos - Términos y Condiciones
- ✅ /privacidad - Política de Privacidad
- ✅ /recuperar-contrasena - Flujo de reset

### Funcionalidades Core
- ✅ Gestión de Productos con stock mínimo
- ✅ Gestión de Estilos de Uñas
- ✅ Gestión de Diseños/Decoraciones
- ✅ Configuración de Gastos Operativos
- ✅ Configuración de Ganancias y Metas
- ✅ Calculadora de Precio Final
- ✅ Gestión de Clientes
- ✅ Sistema de Agenda con estados
- ✅ Reportes Mensuales con gráficos
- ✅ Simulación de Ingresos
- ✅ Historial de Cálculos (Personal)
- ✅ Gestión de Empleados (Comercio)

---

## Credenciales de Prueba

| Rol | Email | Password |
|-----|-------|----------|
| **Admin** | admin@nailcost.pro | NailCost@Admin2024! |
| **Personal** | persona@test.com | test123 |
| **Negocio** | negocio@test.com | test123 |

---

## API Endpoints

### Facturación (Nuevo - Dic 2025)
```
GET  /api/facturas                   - Listar facturas del usuario
POST /api/facturas                   - Crear nueva factura
PUT  /api/facturas/{id}/estado       - Cambiar estado (pendiente/pagada/anulada)
DELETE /api/facturas/{id}            - Eliminar factura
```

### Inventario
```
GET  /api/inventario/movimientos     - Historial de movimientos
POST /api/inventario/movimiento      - Registrar entrada/salida/ajuste
GET  /api/alertas-inventario         - Alertas de stock
```

### Autenticación
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

---

## Stack Tecnológico
- **Frontend:** React 19, Tailwind CSS, Shadcn/UI, Recharts
- **Backend:** FastAPI, Motor (MongoDB async), python-jose, passlib
- **Database:** MongoDB

---

## Backlog

### P1 (Alta Prioridad)
- [ ] Integración Stripe para pagos Premium
- [ ] Envío real de emails (Resend/SendGrid)
- [ ] Configurar MongoDB Atlas para producción

### P2 (Media Prioridad)
- [ ] Reportes por empleado
- [ ] Balance contable mensual detallado
- [ ] Modo oscuro
- [ ] PWA (instalable en móvil)

### P3 (Baja Prioridad)
- [ ] Recordatorios SMS (Twilio)
- [ ] Multi-moneda
- [ ] Backup/restaurar datos

---

## Changelog

### 7 Marzo 2026
- ✅ **Sistema de Facturación completo** para usuarios Comercio
- ✅ Métodos de pago Venezuela (Pago Móvil, Zelle, Transferencia)
- ✅ Generación de facturas HTML para imprimir/descargar
- ✅ Estadísticas de facturación en tiempo real
- ✅ Integración con clientes existentes
- ✅ Tests 100% pasados (Backend: 12/12, Frontend: todos los flujos)

### Diciembre 2025
- ✅ Dashboard COMERCIO minimalista profesional
- ✅ Control de Inventario completo con movimientos
- ✅ Dashboard PERSONA con reportes visuales fáciles
- ✅ Insights y alertas amigables para emprendedoras
- ✅ Gráfico semanal de ingresos
- ✅ Acceso rápido a Gastos desde dashboard
- ✅ Sistema de seguridad: rate limiting, password reset
- ✅ Páginas legales completas
