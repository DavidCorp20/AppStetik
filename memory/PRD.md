# NailCost Pro - PRD (Product Requirements Document)

## Problema Original
Calculadora Inteligente de Costos para Uñas - Sistema profesional de cálculo de costos y precios para servicios de uñas diseñado para nail artists, salones de belleza y emprendedoras del sector beauty.

## Preferencias del Usuario
- **Idioma:** Español
- **Moneda:** USD
- **Almacenamiento:** Multi-usuario con autenticación JWT
- **Estilo:** Minimalista y elegante

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

- **Bloqueo de Funciones Premium:**
  - Componente PremiumGate que bloquea acceso
  - Muestra beneficios de Premium
  - Mensaje para contactar administrador

### Stack Tecnológico
- **Frontend:** React 19, Tailwind CSS, Shadcn/UI, Recharts
- **Backend:** FastAPI, Motor (MongoDB async), python-jose, passlib
- **Base de Datos:** MongoDB con aislamiento por user_id
- **Autenticación:** JWT con bcrypt

## Credenciales

### Usuario Admin
- Email: `admin@nailcost.com`
- Password: `admin123`
- Rol: admin
- Plan: Premium

### Usuario de Prueba
- Email: `test@nailcost.com`
- Password: `test123`
- Rol: user
- Plan: Premium (actualizado por admin)

## Backlog - Features Pendientes

### P1 (Alta Prioridad)
- Integración de pagos Stripe para upgrade automático a Premium
- Acciones rápidas personalizables en Dashboard

### P2 (Media Prioridad)
- Notificaciones por email/WhatsApp
- Duplicar estilos existentes
- Modo oscuro

### P3 (Baja Prioridad)
- Soporte multi-moneda
- Backup/restaurar datos
- Recordatorios SMS (Twilio)
- App móvil nativa
