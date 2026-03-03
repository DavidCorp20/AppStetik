# NailCost Pro - PRD (Product Requirements Document)

## Problema Original
Calculadora Inteligente de Costos para Uñas - Sistema profesional de cálculo de costos y precios para servicios de uñas diseñado para nail artists, salones de belleza y emprendedoras del sector beauty.

## Preferencias del Usuario
- **Idioma:** Español
- **Moneda:** USD
- **Almacenamiento:** Multi-usuario con autenticación JWT
- **Estilo:** Minimalista y elegante
- **Extra:** Compartir reportes, Exportar PDF/Excel

## User Personas
1. **Nail Artist Independiente:** Profesional que trabaja por cuenta propia
2. **Dueña de Salón:** Propietaria de un salón de belleza
3. **Emprendedora Beauty:** Persona iniciando en el negocio

## Lo Implementado

### MVP Inicial ✅
- Dashboard con resumen de rentabilidad
- Gestión de Productos/Insumos con cálculo automático de costo unitario
- Gestión de Estilos de Uñas con productos, tiempo y dificultad
- Gestión de Diseños/Decoraciones
- Configuración de Gastos Operativos con prorrateo automático
- Configuración de Ganancias con margen y metas
- Calculadora de Precio Final con alertas inteligentes
- Reporte de Rentabilidad con compartir

### Mejoras Fase 2 ✅
- **Gestión de Clientes:** Nombre, teléfono, email, notas, historial de visitas
- **Sistema de Agenda:** Vista semanal, crear/editar/completar citas
- **Alertas de Citas Próximas:** En dashboard y sidebar
- **Registro de Servicios Realizados:** Al completar citas
- **Reportes Mensuales:** Gráficos de ingresos, distribución por servicio
- **Comparativa Mensual:** Últimos 6 meses con gráficos
- **Exportar PDF:** Vista de impresión
- **Exportar Excel:** Descarga CSV
- **Simulación de Ingresos:** Proyecciones según capacidad
- **Ranking de Servicios:** Por rentabilidad/hora

### Sistema de Autenticación ✅ (Marzo 2026)
- **Registro de usuarios:** Email, contraseña, nombre, negocio
- **Login/Logout:** JWT con token de 30 días
- **Rutas protegidas:** Todas las rutas requieren autenticación
- **Multi-tenancy:** Aislamiento completo de datos por usuario
- **Planes de suscripción:** Free y Premium con límites
- **Menú de usuario:** Con información del plan y logout

### Stack Tecnológico
- **Frontend:** React 19, Tailwind CSS, Shadcn/UI, Recharts, Lucide Icons
- **Backend:** FastAPI, Motor (MongoDB async), python-jose, passlib
- **Base de Datos:** MongoDB con aislamiento por user_id
- **Autenticación:** JWT con bcrypt para contraseñas

## Fórmula de Precio
```
Precio = Costo Productos + Gasto Operativo/Servicio + Costo Tiempo + Costo Diseños + Margen Ganancia
```

## Límites por Plan
| Recurso | Free | Premium |
|---------|------|---------|
| Productos | 10 | Ilimitado |
| Estilos | 5 | Ilimitado |
| Diseños | 5 | Ilimitado |
| Clientes | 20 | Ilimitado |
| Exportar | No | Sí |
| Simulación | No | Sí |
| Reportes | No | Sí |

## Backlog - Features Pendientes

### P1 (Alta Prioridad)
- Acciones rápidas personalizables en Dashboard
- Integración de pagos para plan Premium

### P2 (Media Prioridad)
- Notificaciones por email/WhatsApp
- Duplicar estilos existentes
- Modo oscuro

### P3 (Baja Prioridad)
- Soporte multi-moneda
- Backup/restaurar datos (JSON)
- Comparador de precios con competencia
- App móvil nativa
- Recordatorios SMS (Twilio)
- Temas personalizables

## Métricas de Éxito
- Usuarios pueden calcular precios en menos de 1 minuto
- Dashboards muestran datos en tiempo real
- Exportaciones funcionan sin errores
- Agenda muestra citas correctamente
- Login/Registro sin fricciones

## Credenciales de Prueba
- Email: test@nailcost.com
- Password: test123
