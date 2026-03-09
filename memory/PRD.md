# NailCost Pro - PRD

## Credenciales de Prueba
| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@nailcost.pro | NailCost@Adm1n#2024Secure |
| Comercio | elite.nails@test.com | Test123! |
| Personal | maria.nails@test.com | Test123! |
| Comercio 2 | glamour.spa@test.com | Test123! |

---

## Última Actualización: 09 Marzo 2026

### IMPLEMENTADO EN ESTA SESIÓN

#### 1. Sistema de Pagos Tradicionales ✅ (NUEVO)
**Backend (`/app/backend/server.py`):**
- `GET /api/payment-methods` - Lista métodos de pago disponibles
- `POST /api/pagos/registrar` - Registrar pago con comprobante (FormData + imagen)
- `GET /api/pagos/mis-pagos` - Historial de pagos del usuario
- `GET /api/admin/pagos` - Admin: ver todos los pagos
- `GET /api/admin/pagos/{id}/comprobante` - Admin: ver imagen de comprobante
- `PUT /api/admin/pagos/{id}/aprobar` - Admin: aprobar pago y activar suscripción
- `PUT /api/admin/pagos/{id}/rechazar` - Admin: rechazar pago

**Frontend:**
- Nueva página `/pagos` (`PagosPage.jsx`) para usuarios Persona y Empresa
- Nuevo tab "Pagos" en AdminPage con panel completo de gestión
- Métodos soportados: Pago Móvil, Transferencia, Binance/USDT, Efectivo, Zelle
- Subida de comprobante de pago como imagen (base64)
- Aprobación automática activa la suscripción del usuario

**Flujo:**
1. Usuario navega a `/pagos`
2. Selecciona plan (Básico/Premium) y duración (1-12 meses)
3. Ve datos de pago de la plataforma (banco, teléfono, etc.)
4. Realiza el pago y sube comprobante
5. Admin revisa en tab "Pagos" y aprueba/rechaza
6. Al aprobar, suscripción del usuario se activa automáticamente

#### 2. Sistema de Catálogos Pre-definidos ✅ (NUEVO)
**Archivo de catálogos (`/app/frontend/src/data/catalogos.js`):**
- `CATALOGO_PRODUCTOS`: +150 productos organizados por categoría
  - Manicure/Pedicure, Pestañas, Cejas, Peluquería, General
- `CATALOGO_ESTILOS`: +70 servicios con precios sugeridos
  - Manicure, Acrílico, Gel/Polygel, Nail Art, Pedicure, Pestañas, Cejas, Peluquería

**ProductosPage actualizada:**
- Botón "Catálogo" para explorar productos pre-definidos
- Selección múltiple para agregar varios productos a la vez
- Filtros por categoría y búsqueda
- Precios sugeridos editables

**EstilosPage actualizada:**
- Botón "Catálogo" para explorar servicios pre-definidos
- Selección múltiple para agregar varios servicios a la vez
- Muestra tiempo, dificultad y precio sugerido
- Filtros por categoría

#### 2. Tutoriales en Todas las Páginas ✅
- Productos, Estilos, Clientes, Gastos
- Calculadora, Inventario, Simulación
- Reportes Financieros
- Cada página muestra tutorial automático en primera visita
- Botón "Ayuda" disponible siempre

#### 3. Presentación de Ventas ✅
- Ubicación: `/presentacion.html`
- 7 slides profesionales

#### 4. Panel Admin Completo ✅
- Control de precios de suscripción
- Control de costos operativos con análisis de rentabilidad
- **NUEVO:** Panel de gestión de pagos de usuarios

#### 5. Dashboard Comercio Mejorado ✅
- Top Servicios con ranking visual
- Meta mensual con progreso
- Sistema de alertas pop

---

### ESTADO DEL SISTEMA

| Módulo | Estado |
|--------|--------|
| Login/Registro | ✅ |
| Dashboard Admin | ✅ |
| Dashboard Comercio | ✅ |
| Dashboard Persona | ✅ |
| Productos + Tutorial | ✅ |
| Estilos + Tutorial | ✅ |
| Clientes + Tutorial | ✅ |
| Gastos + Tutorial | ✅ |
| Calculadora + Tutorial | ✅ |
| Inventario + Tutorial | ✅ |
| Simulación + Tutorial | ✅ |
| Reportes + Tutorial | ✅ |
| Facturación | ✅ |
| Alertas Pop | ✅ |
| Presentación Ventas | ✅ |
| **Sistema de Pagos** | ✅ |
| **Catálogo Productos** | ✅ |
| **Catálogo Servicios** | ✅ |

---

## URLS IMPORTANTES

- **App**: https://salon-margin-tool.preview.emergentagent.com
- **Página de Pagos**: https://salon-margin-tool.preview.emergentagent.com/pagos
- **Presentación**: https://salon-margin-tool.preview.emergentagent.com/presentacion.html
- **Roadmap**: /app/memory/ROADMAP.md

---

## PRÓXIMOS PASOS (Ver ROADMAP.md)

### Fase 1: Estabilización
- [ ] Testing completo
- [ ] Correcciones responsive
- [ ] Optimización rendimiento

### Fase 2: Pre-Lanzamiento
- [ ] Dominio producción
- [ ] Servidor DigitalOcean
- [ ] Email transaccional (SendGrid)
- [ ] Pasarela de pagos automática (Stripe) - opcional

### Fase 3: Beta
- [ ] 10-20 usuarios reales
- [ ] Videos tutoriales
- [ ] Marketing Instagram

---

## COSTOS OPERATIVOS

| Servicio | Costo/mes |
|----------|-----------|
| MongoDB Atlas M10 | $57 |
| DigitalOcean 4GB | $24 |
| Cloudflare Pro | $20 |
| SendGrid | $15 |
| Backup | $5 |
| **TOTAL** | **$121** |

### Punto de Equilibrio
- 25 usuarios Personal Básico ($5)
- 11 usuarios Personal Premium ($12)
- 5 usuarios Business Premium ($30)
