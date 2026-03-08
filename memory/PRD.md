# NailCost Pro - PRD

## Credenciales Admin (PERMANENTES)
| Email | Password |
|-------|----------|
| **admin@nailcost.pro** | **NailCost@Adm1n#2024Secure** |

---

## Precios de Suscripción
| Plan | Personal | Comercio |
|------|----------|----------|
| Básico | $5/mes | $15/mes |
| Premium | $10/mes | $20/mes |

**Trial:** 15 días gratis

---

## Funcionalidades ✅

### Login Profesional (MEJORADO)
- ✅ Diseño split-screen: branding + formulario
- ✅ Panel izquierdo oscuro con features
- ✅ Equilibrio profesional para todos los usuarios
- ✅ Badges "Emprendedoras" y "Salones"

### Sistema de Activación (MEJORADO)
- ✅ Registro → Estado PENDIENTE (no puede usar)
- ✅ Admin activa → Inicia TRIAL 15 días
- ✅ Trial vence → Bloqueo con mensaje de pago
- ✅ Admin registra pago → Activa suscripción
- ✅ Suscripción vence → Bloqueo automático

### Panel Admin Especializado (NUEVO)
- ✅ **Diseño oscuro profesional**
- ✅ **Stats**: Ingresos/mes, Pendientes, Vencidos, Activos
- ✅ **Tabs especializados:**
  - Pendientes Activación (con botón Activar)
  - Vencidos/Espera Pago (con Registrar Pago)
  - Usuarios Activos (gestión completa)
  - Facturas Pendientes (marcar pagadas)
  - Todas las Facturas (historial)
- ✅ **Acciones**: Activar, Registrar pago, Generar factura, Blanquear contraseña, Suspender
- ✅ **Alertas**: Notificación de usuarios pendientes/vencidos

### Control de Suscripciones
- ✅ Fecha inicio/fin visible
- ✅ Días restantes con alerta < 5 días
- ✅ Renovación desde admin
- ✅ Generación de facturas automáticas

### Reportes Financieros (Comercio)
- ✅ Estado de Resultados
- ✅ Ranking de servicios por ganancia
- ✅ Desglose de gastos
- ✅ Tendencias mensuales

---

## Base de Datos: MongoDB Atlas ✅
```
mongodb+srv://arenasdavid1_db_user:***@cluster0.s2mz4tv.mongodb.net/nailcost_pro
```

---

## Archivos Importantes

- `/app/GUIA_LANZAMIENTO.md` - Pasos para lanzar la app
- `/app/memory/PRD.md` - Este documento

---

## Flujo de Pago

```
Usuario se registra → PENDIENTE
     ↓
Admin activa → TRIAL 15 días
     ↓
Trial vence → BLOQUEADO (mensaje: "Realiza tu pago")
     ↓
Usuario paga (Pago Móvil/Zelle)
     ↓
Contacta admin (WhatsApp/Email)
     ↓
Admin registra pago → ACTIVO (1-12 meses)
     ↓
Suscripción vence → BLOQUEADO → Repetir
```

---

## Backlog

### Para monetizar automático
- [ ] Integrar Stripe para cobros automáticos
- [ ] Renovación automática mensual
- [ ] Emails de recordatorio de vencimiento

### Mejoras UI/UX
- [ ] Modo oscuro
- [ ] PWA instalable completa

---

## Changelog

### 8 Marzo 2026 (Sesión actual)
- ✅ Login profesional con diseño split-screen
- ✅ Panel Admin especializado con tema oscuro
- ✅ Sistema de bloqueo por suscripción vencida
- ✅ Flujo de espera de pago
- ✅ Guía de lanzamiento completa

### Anteriores
- Sistema de facturación completo
- Control de inventario
- Reportes financieros
- Notificaciones push
- MongoDB Atlas conectado
