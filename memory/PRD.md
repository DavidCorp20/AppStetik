# NailCost Pro - PRD (Product Requirements Document)

## Problema Original
Calculadora Inteligente de Costos para Uñas - Sistema profesional de cálculo de costos y precios para servicios de uñas diseñado para nail artists, salones de belleza y emprendedoras del sector beauty.

## Preferencias del Usuario
- **Idioma:** Español
- **Moneda:** USD
- **Almacenamiento:** Solo sesión (sin autenticación)
- **Estilo:** Minimalista y elegante
- **Extra:** Compartir reportes

## User Personas
1. **Nail Artist Independiente:** Profesional que trabaja por cuenta propia y necesita calcular precios justos para sus servicios
2. **Dueña de Salón:** Propietaria de un salón de belleza que necesita gestionar costos de múltiples servicios y empleadas
3. **Emprendedora Beauty:** Persona que está iniciando en el negocio y necesita entender su estructura de costos

## Requisitos Core

### Secciones Implementadas
1. ✅ **Productos/Insumos:** Gestión de insumos y herramientas con cálculo de costo unitario
2. ✅ **Estilos de Uñas:** Servicios personalizables con productos, tiempo y dificultad
3. ✅ **Diseños/Decoraciones:** Opciones adicionales con costo y tiempo extra
4. ✅ **Gastos Operativos:** Gastos mensuales fijos con prorrateo automático
5. ✅ **Configuración de Ganancias:** Margen de ganancia y metas de ingresos
6. ✅ **Calculadora de Precio:** Cálculo automático del precio recomendado
7. ✅ **Reportes:** Análisis de rentabilidad con opción de compartir

### Fórmula de Precio
```
Precio Final = Costo Productos + Gasto Operativo Prorrateado + Costo Tiempo + Costo Diseños + Margen de Ganancia
```

## Lo Implementado (Enero 2026)

### Backend (FastAPI + MongoDB)
- CRUD completo para Productos, Estilos, Diseños
- Gestión de Gastos Operativos
- Configuración de Ganancias
- Endpoint de Cálculo de Precio con alertas inteligentes
- Endpoint de Reporte completo
- Seed data para datos de ejemplo

### Frontend (React + Tailwind + Shadcn)
- Dashboard con resumen y alertas
- Navegación responsive
- 8 páginas funcionales
- Diseño minimalista con tipografía Playfair Display + Manrope
- Calculadora estilo recibo
- Compartir reportes via Web Share API

## Backlog - Features Pendientes

### P0 (Alta Prioridad)
- N/A - MVP Completo

### P1 (Media Prioridad)
- Exportar reporte a PDF
- Historial de cálculos
- Duplicar estilos existentes

### P2 (Baja Prioridad)
- Soporte multi-moneda
- Modo oscuro
- Backup/restaurar datos (JSON)
- Comparador de precios con competencia

## Próximos Pasos
1. Agregar más productos y estilos según necesidades reales
2. Ajustar gastos operativos con datos reales del negocio
3. Configurar metas de ganancia personalizadas
4. Usar la calculadora para definir precios de servicios

## Stack Tecnológico
- **Frontend:** React 19, Tailwind CSS, Shadcn/UI, Lucide Icons
- **Backend:** FastAPI, Motor (MongoDB async)
- **Base de Datos:** MongoDB
- **Estilo:** Minimalista, Organic & Earthy theme
