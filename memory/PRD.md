# NailCost Pro - PRD

## Credenciales de Prueba
| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@nailcost.pro | NailCost@Adm1n#2024Secure |
| Comercio | elite.nails@test.com | Test123! |
| Personal | maria.nails@test.com | Test123! |
| Comercio 2 | glamour.spa@test.com | Test123! |
| **Sub-usuario Empleado** | ana.garcia@elite.nails.test | SecurePass123! |
| **Sub-usuario Admin** | carlos.admin@elite.nails.test | AdminPass456! |

---

## Última Actualización: 12 Marzo 2026

### IMPLEMENTADO HOY (12 Mar 2026) - FASE 1 MULTI-USUARIO ✅

#### Sistema Multi-Usuario para Negocios (Backend)

**Colección `business_users`:**
```javascript
{
  id: "uuid",
  business_id: "owner_user_id",  // ID del comercio propietario
  nombre: "string",
  email: "string",
  password: "hashed",
  role: "owner|administrador|empleado",
  permissions: ["view_dashboard", "create_clients", ...],
  especialidad: "string",
  comision_porcentaje: 0,
  activo: true,
  last_login: "datetime",
  created_at: "datetime"
}
```

**Endpoints Nuevos:**
- `GET /api/business/users` - Listar sub-usuarios (owner/admin)
- `GET /api/business/users/{id}` - Obtener sub-usuario
- `POST /api/business/users` - Crear sub-usuario (solo owner)
- `PUT /api/business/users/{id}` - Actualizar sub-usuario (solo owner)
- `DELETE /api/business/users/{id}` - Eliminar sub-usuario (solo owner)
- `POST /api/business/users/{id}/reset-password` - Restablecer contraseña
- `GET /api/business/roles` - Listar roles disponibles
- `GET /api/business/permissions` - Listar permisos por categoría
- `GET /api/business/my-permissions` - Ver mis permisos

**Sistema de Roles:**
| Rol | Permisos | Descripción |
|-----|----------|-------------|
| Owner | 31 permisos | Acceso completo, gestión de usuarios |
| Administrador | 20 permisos | Operacional, sin gestión de usuarios |
| Empleado | 8 permisos | Solo visualización y citas básicas |

**Login Actualizado:**
- Soporta autenticación de sub-usuarios (colección `business_users`)
- Token incluye `type: "business_user"` y `business_id`
- Sub-usuarios acceden a datos del negocio propietario via `effective_user_id`

**Testing:** 29/29 tests pasados (100%)

---

### IMPLEMENTADO HOY (12 Mar 2026) - OPTIMIZACIÓN MÓVIL ✅

#### Bottom Navigation para Comercio
- Barra de navegación inferior fija en pantallas < 1024px
- 5 accesos directos: Inicio, Agenda, Cotizar (botón primario), Clientes, Facturar
- Diseño touch-friendly con tap-effect animations
- Safe-area support para dispositivos con notch

#### Vista de Cards Responsiva
- **ClientesPage**: Cards en móvil (<768px), tabla en desktop
- **ProductosPage**: Cards en móvil (<768px), tabla en desktop
- Cards muestran información condensada con acciones rápidas
- Links clickeables para teléfono (tel:) y email (mailto:)

#### Estilos CSS Móviles
- `.tap-effect`: Feedback visual en taps (scale + opacity)
- `.safe-area-bottom`: Padding para iPhone X+ 
- `.hide-scrollbar`: Ocultar scrollbar manteniendo scroll
- `.line-clamp-1/2`: Truncar texto a 1-2 líneas
- Animaciones: slide-down, slide-up, fade-in

---

### IMPLEMENTADO ANTERIORMENTE

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
| Sistema de Pagos | ✅ |
| Catálogo Productos | ✅ |
| Catálogo Servicios | ✅ |
| **Multi-Usuario Backend** | ✅ |
| **RBAC (Roles/Permisos)** | ✅ |
| **Optimización Móvil** | ✅ |
| Multi-Usuario Frontend | 🔄 Pendiente |

---

## URLS IMPORTANTES

- **App**: https://salon-margin-tool.preview.emergentagent.com
- **Página de Pagos**: https://salon-margin-tool.preview.emergentagent.com/pagos
- **Presentación**: https://salon-margin-tool.preview.emergentagent.com/presentacion.html
- **Roadmap**: /app/memory/ROADMAP.md

---

## IMPLEMENTADO HOY (09 Mar 2026)

#### 3. Impuestos Personalizables en Facturación ✅
- IVA 16% (activable)
- Retención ISLR 5% (activable)
- Impuesto Municipal 2% (activable)
- Agregar impuestos personalizados

#### 4. Planes con Descuentos ✅
- Mensual: sin descuento
- Trimestral: 10% OFF
- Semestral: 20% OFF
- Anual: 30% OFF

#### 5. Presentaciones de Ventas Diferenciadas ✅
- `/presentacion-persona.html` - Para emprendedoras independientes
- `/presentacion-comercio.html` - Para salones y spas

#### 6. Fix Botones Reportes Admin ✅
- Botones ahora con colores sólidos (emerald-600, blue-600)

---

## PRÓXIMOS PASOS

### Proyecto Multi-Usuario & Optimización Móvil

#### Fase 2: Frontend Gestión de Usuarios (P1 - Próximo)
- [ ] Crear página `GestionUsuariosPage.jsx`
- [ ] Panel de listado de sub-usuarios con estado
- [ ] Modal para crear/editar usuarios
- [ ] Selector de rol con permisos automáticos
- [ ] Configuración de permisos personalizados
- [ ] Integrar en menú lateral del Comercio

#### Fase 3: Middleware RBAC en Frontend (P1)
- [ ] Hook `usePermissions()` para verificar permisos
- [ ] Componente `ProtectedAction` para botones/acciones
- [ ] Ocultar elementos del menú según permisos
- [ ] Mostrar mensaje de acceso denegado

#### Fase 5: Estabilidad (P2)
- [ ] Global loading states
- [ ] Error boundaries
- [ ] Debounce en búsquedas

### Backlog
- [ ] "Ver más" en Recomendaciones Inteligentes
- [ ] Videos tutoriales
- [ ] Pasarela de pagos automática (Stripe)

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
