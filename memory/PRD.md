# NailCost Pro - PRD (Product Requirements Document)

## Problema Original
Calculadora Inteligente de Costos para Uñas - Sistema profesional de cálculo de costos y precios para servicios de uñas diseñado para nail artists, salones de belleza y emprendedoras del sector beauty.

## Preferencias del Usuario
- **Idioma:** Español
- **Moneda:** USD
- **Almacenamiento:** Solo sesión (sin autenticación)
- **Estilo:** Minimalista y elegante
- **Extra:** Compartir reportes, Exportar PDF/Excel

## User Personas
1. **Nail Artist Independiente:** Profesional que trabaja por cuenta propia
2. **Dueña de Salón:** Propietaria de un salón de belleza
3. **Emprendedora Beauty:** Persona iniciando en el negocio

## Lo Implementado (Enero 2026)

### MVP Inicial ✅
- Dashboard con resumen de rentabilidad
- Gestión de Productos/Insumos con cálculo automático de costo unitario
- Gestión de Estilos de Uñas con productos, tiempo y dificultad
- Gestión de Diseños/Decoraciones
- Configuración de Gastos Operativos con prorrateo automático
- Configuración de Ganancias con margen y metas
- Calculadora de Precio Final con alertas inteligentes
- Reporte de Rentabilidad con compartir

### Mejoras Fase 2 ✅ (Enero 2026)
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

### Stack Tecnológico
- **Frontend:** React 19, Tailwind CSS, Shadcn/UI, Recharts, Lucide Icons
- **Backend:** FastAPI, Motor (MongoDB async)
- **Base de Datos:** MongoDB

## Fórmula de Precio
```
Precio = Costo Productos + Gasto Operativo/Servicio + Costo Tiempo + Costo Diseños + Margen Ganancia
```

## Backlog - Features Pendientes

### P1 (Media Prioridad)
- Notificaciones por email/WhatsApp
- Duplicar estilos existentes
- Modo oscuro

### P2 (Baja Prioridad)
- Soporte multi-moneda
- Backup/restaurar datos (JSON)
- Comparador de precios con competencia
- App móvil nativa

## Métricas de Éxito
- Usuarios pueden calcular precios en menos de 1 minuto
- Dashboards muestran datos en tiempo real
- Exportaciones funcionan sin errores
- Agenda muestra citas correctamente

## Próximos Pasos Sugeridos
1. Agregar clientes reales al sistema
2. Crear citas y registrar servicios
3. Ver reportes mensuales con datos reales
4. Usar simulación para planificar crecimiento
