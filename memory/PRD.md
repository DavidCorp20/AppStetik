# NailCost Pro - PRD (Product Requirements Document)

## Problema Original
Calculadora Inteligente de Costos para Uñas - Sistema profesional de cálculo de costos y precios para servicios de uñas diseñado para nail artists, salones de belleza y emprendedoras del sector beauty.

## Preferencias del Usuario
- **Idioma:** Español
- **Moneda:** USD
- **Almacenamiento:** Multi-usuario con autenticación JWT
- **Estilo:** Rosa intenso para Personal, Púrpura para Negocio

## Lo Implementado

### MVP Inicial ✅
- Dashboard con resumen de rentabilidad
- Gestión de Productos/Insumos con cálculo automático de costo unitario
- Gestión de Estilos de Uñas con productos, tiempo y dificultad
- Gestión de Diseños/Decoraciones
- Configuración de Gastos Operativos con prorrateo automático
- Configuración de Ganancias con margen y metas
- Calculadora de Precio Final con alertas inteligentes
- Reporte de Rentabilidad

### Mejoras Fase 2 ✅
- Gestión de Clientes
- Sistema de Agenda
- Alertas de Citas Próximas
- Registro de Servicios Realizados
- Reportes Mensuales con gráficos
- Exportar PDF y Excel
- Simulación de Ingresos
- Ranking de Servicios

### Sistema de Autenticación ✅ (Marzo 2026)
- Registro de usuarios con email/contraseña
- Login/Logout con JWT (30 días)
- Rutas protegidas
- Multi-tenancy con aislamiento de datos por usuario
- Menú de usuario con información del plan

### Sistema de Planes y Administración ✅ (Marzo 2026)
- **Plan Básico (free):**
  - Máx 10 productos
  - Máx 5 estilos
  - Máx 5 diseños
  - Máx 20 clientes
  - Sin acceso a: Reportes, Simulación, Exportar

- **Plan Premium:**
  - Todo ilimitado
  - Acceso completo a todas las funciones

- **Panel de Administración:**
  - Dashboard con estadísticas del sistema
  - Lista de todos los usuarios registrados
  - Ver plan y uso de cada usuario
  - Cambiar plan de usuarios (Dar/Quitar Premium)
  - Solo accesible para usuarios con rol "admin"

### Experiencia Dual Persona/Comercio ✅ (Diciembre 2025)

#### Usuario Personal (Nail Artist Individual)
- **Tema:** Rosa intenso (#E84A8A)
- **Dashboard:** Tipo app móvil, interactivo
  - Header compacto con logo y menú de usuario
  - Stats circulares (Cálculos hoy, Citas, Clientes)
  - Acceso Rápido con iconos grandes
  - Cálculos Recientes con opciones de compartir
  - Tips del día
- **Navegación:** Bottom bar fija con 5 items
  - Inicio, Clientes, Calcular (central destacado), Agenda, Historial
- **Features exclusivas:**
  - FloatingCalculator (botón flotante rosa)
  - Página de Historial de cálculos
  - Compartir cotización por WhatsApp

#### Usuario Negocio (Salón/Estética)
- **Tema:** Púrpura profesional (#8B5CF6)
- **Dashboard:** Panel de control empresarial
  - Header con navegación completa y dropdowns
  - KPIs (Ingresos Est., Clientes, Empleados, Gastos/Mes)
  - Agenda de Hoy con estados de citas
  - Sección de Rendimiento con gráficos
  - Panel lateral: Equipo de trabajo e Inventario
- **Navegación:** Header con dropdowns
  - Principal: Dashboard, Clientes, Agenda, Empleados
  - Servicios: Productos, Estilos, Diseños
  - Finanzas: Gastos, Ganancias
  - Herramientas: Calculadora, Reportes, Simulación
- **Features exclusivas:**
  - Gestión de Empleados (CRUD completo)
  - Alertas de Inventario (stock bajo/agotado)
  - Métricas de negocio

### Stack Tecnológico
- **Frontend:** React 19, Tailwind CSS, Shadcn/UI, Recharts
- **Backend:** FastAPI, Motor (MongoDB async), python-jose, passlib
- **Base de Datos:** MongoDB con aislamiento por user_id
- **Autenticación:** JWT con bcrypt

## Credenciales de Prueba

### Usuario Admin
- Email: `admin@nailcost.pro`
- Password: `adminpassword`
- Rol: admin
- Plan: Premium

### Usuario Personal
- Email: `persona@test.com`
- Password: `test123`
- Tipo: personal
- Plan: free

### Usuario Negocio
- Email: `negocio@test.com`
- Password: `test123`
- Tipo: business
- Negocio: "Uñas Elegante"
- Plan: free

## Arquitectura de Archivos Clave

```
/app/
├── backend/
│   └── server.py          # FastAPI con user_type, empleados, historial
├── frontend/src/
│   ├── App.js             # Router con DashboardRouter
│   ├── components/
│   │   ├── Layout.jsx     # PersonaLayout + ComercioLayout
│   │   └── FloatingCalculator.jsx
│   ├── context/
│   │   └── AuthContext.js # isBusinessUser, isPersonalUser
│   └── pages/
│       ├── PersonaDashboard.jsx
│       ├── ComercioDashboard.jsx
│       ├── HistorialPage.jsx
│       ├── EmpleadosPage.jsx
│       └── ...
```

## API Endpoints Clave

### Autenticación
- `POST /api/auth/register` - Incluye campo user_type
- `POST /api/auth/login`
- `GET /api/auth/me` - Retorna user_type

### Personal (Historial)
- `GET /api/historial-calculos`
- `POST /api/historial-calculos`
- `DELETE /api/historial-calculos/{id}`

### Negocio (Empleados)
- `GET /api/empleados`
- `POST /api/empleados` (solo business)
- `PUT /api/empleados/{id}`
- `DELETE /api/empleados/{id}`

### Inventario
- `GET /api/alertas-inventario`

### Stats
- `GET /api/quick-stats` - Retorna stats según user_type

## Backlog - Features Pendientes

### P1 (Alta Prioridad)
- Integración de pagos Stripe para upgrade automático a Premium
- Guardar cálculos automáticamente al historial

### P2 (Media Prioridad)
- Notificaciones por email/WhatsApp
- Reportes por empleado (para Negocio)
- Modo oscuro

### P3 (Baja Prioridad)
- Soporte multi-moneda
- Backup/restaurar datos
- Recordatorios SMS (Twilio)
- App móvil nativa (PWA)

## Notas de Implementación

### Diferenciación de UX
- El tipo de usuario se selecciona al registrarse
- `AuthContext` expone `isBusinessUser` y `isPersonalUser`
- `Layout.jsx` renderiza `PersonaLayout` o `ComercioLayout` según el tipo
- `App.js` usa `DashboardRouter` que selecciona el dashboard correcto

### Testing
- Test report: `/app/test_reports/iteration_3.json`
- Backend: 15/15 tests pasados
- Frontend: Todas las UIs funcionando correctamente
