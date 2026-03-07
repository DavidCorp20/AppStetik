# NailCost Pro - PRD (Product Requirements Document)

## Problema Original
Calculadora Inteligente de Costos para Uñas - Sistema profesional de cálculo de costos y precios para servicios de uñas diseñado para nail artists, salones de belleza y emprendedoras del sector beauty.

## Preferencias del Usuario
- **Idioma:** Español
- **Moneda:** USD
- **Experiencia Persona:** Rosa interactivo, tipo app móvil
- **Experiencia Comercio:** Azul corporativo profesional

---

## Lo Implementado ✅

### Sistema de Autenticación
- ✅ Registro de usuarios con email/contraseña
- ✅ Login/Logout con JWT (30 días)
- ✅ **Rate limiting** en login (5 intentos, bloqueo 5 min)
- ✅ **Recuperación de contraseña** con token
- ✅ Selección de tipo de cuenta (Personal/Negocio)

### Experiencia Dual UX (Diciembre 2025)

#### Usuario Personal (Rosa #E84A8A)
- ✅ Dashboard interactivo tipo app móvil
- ✅ Hero card con saludo dinámico y racha de actividad
- ✅ Stats circulares animados
- ✅ Acceso Rápido con iconos grandes y badges
- ✅ Cálculos Recientes expandibles con compartir WhatsApp
- ✅ Logros y Tips personalizados
- ✅ **Bottom navigation bar** fija con 5 items
- ✅ Botón central de Calcular destacado
- ✅ FloatingCalculator para acceso rápido
- ✅ Página de Historial de cálculos

#### Usuario Negocio (Azul corporativo #1E3A5F)
- ✅ Dashboard profesional con métricas empresariales
- ✅ Header con navegación completa y dropdowns
- ✅ KPIs Cards: Ingresos, Clientes, Equipo, Gastos
- ✅ Barra de progreso de Meta Mensual
- ✅ Agenda de Hoy con estados de citas
- ✅ Rendimiento por Servicio con rankings
- ✅ Panel de Equipo en sidebar
- ✅ Alertas de Inventario
- ✅ Gestión de Empleados (CRUD completo)
- ✅ Tema corporativo con tipografía Inter

### Páginas Legales
- ✅ Términos y Condiciones (/terminos)
- ✅ Política de Privacidad (/privacidad)
- ✅ Checkbox de aceptación en registro

### Funcionalidades Core
- ✅ Gestión de Productos/Insumos
- ✅ Gestión de Estilos de Uñas
- ✅ Gestión de Diseños/Decoraciones
- ✅ Configuración de Gastos Operativos
- ✅ Configuración de Ganancias
- ✅ Calculadora de Precio Final
- ✅ Reporte de Rentabilidad
- ✅ Gestión de Clientes
- ✅ Sistema de Agenda
- ✅ Reportes Mensuales con gráficos
- ✅ Simulación de Ingresos

### Sistema de Planes
- **Plan Básico (free):** Límites en productos, estilos, clientes
- **Plan Premium:** Todo ilimitado + reportes avanzados

---

## Credenciales de Prueba

| Rol | Email | Password |
|-----|-------|----------|
| **Admin** | admin@nailcost.pro | NailCost@Admin2024! |
| **Personal** | persona@test.com | test123 |
| **Negocio** | negocio@test.com | test123 |

---

## Stack Tecnológico

### Frontend
- React 19
- Tailwind CSS
- Shadcn/UI
- Lucide Icons
- Recharts

### Backend
- FastAPI
- Motor (MongoDB async)
- python-jose (JWT)
- passlib (bcrypt)

### Base de Datos
- MongoDB

---

## API Endpoints Clave

### Autenticación
```
POST /api/auth/register     - Registro con user_type
POST /api/auth/login        - Login con rate limiting
GET  /api/auth/me           - Info del usuario actual
POST /api/auth/forgot-password  - Solicitar reset
POST /api/auth/reset-password   - Confirmar nuevo password
```

### Negocio (Comercio)
```
GET/POST   /api/empleados           - CRUD empleados
GET        /api/alertas-inventario  - Alertas de stock
```

### Personal
```
GET/POST   /api/historial-calculos  - Historial de cálculos
DELETE     /api/historial-calculos/:id
```

---

## Arquitectura de Archivos

```
/app/
├── backend/
│   └── server.py         # FastAPI con rate limiting, password reset
├── frontend/src/
│   ├── App.js            # Router con rutas legales
│   ├── index.css         # Temas rosa y azul corporativo
│   ├── components/
│   │   ├── Layout.jsx    # PersonaLayout + ComercioLayout
│   │   └── FloatingCalculator.jsx
│   ├── pages/
│   │   ├── PersonaDashboard.jsx    # Dashboard interactivo
│   │   ├── ComercioDashboard.jsx   # Dashboard profesional
│   │   ├── HistorialPage.jsx
│   │   ├── EmpleadosPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── TerminosPage.jsx
│   │   └── PrivacidadPage.jsx
```

---

## Backlog

### P1 (Alta Prioridad)
- [ ] Integración Stripe para pagos Premium
- [ ] Guardar cálculos automáticamente al historial
- [ ] Envío real de emails para password reset

### P2 (Media Prioridad)
- [ ] Reportes por empleado (Negocio)
- [ ] Modo oscuro
- [ ] PWA (instalable en móvil)
- [ ] Notificaciones push

### P3 (Baja Prioridad)
- [ ] Recordatorios SMS (Twilio)
- [ ] Multi-moneda
- [ ] Backup/restaurar datos

---

## Changelog

### Diciembre 2025
- ✅ Experiencia dual Persona/Comercio
- ✅ Nuevo tema azul corporativo para Comercio
- ✅ Dashboard interactivo para Persona con animaciones
- ✅ Bottom navigation bar móvil
- ✅ Sistema de seguridad: rate limiting, password reset
- ✅ Páginas legales: Términos y Privacidad
- ✅ Credenciales admin actualizadas

### Marzo 2025
- ✅ Sistema de autenticación JWT
- ✅ Multi-tenancy por usuario
- ✅ Planes Básico/Premium
- ✅ Panel de administración

### Febrero 2025
- ✅ MVP inicial
- ✅ Calculadora de costos
- ✅ Gestión de productos, estilos, diseños
