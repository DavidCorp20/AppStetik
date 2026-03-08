# Guía de Lanzamiento - NailCost Pro

## ✅ Lo que ya está listo

| Componente | Estado |
|------------|--------|
| Sistema de autenticación completo | ✅ |
| Dual UX (Persona/Comercio) | ✅ |
| Panel Admin especializado | ✅ |
| Sistema de activación de usuarios | ✅ |
| Trial 15 días | ✅ |
| Control de suscripciones | ✅ |
| Bloqueo por suscripción vencida | ✅ |
| Facturación usuarios | ✅ |
| Facturación admin | ✅ |
| Reportes financieros | ✅ |
| Inventario | ✅ |
| MongoDB Atlas (producción) | ✅ |

---

## 📋 Pasos para Lanzar

### PASO 1: Configurar Dominio Personalizado
1. Compra un dominio (ej: nailcost.pro, nailcostpro.com)
   - Recomendado: Namecheap, GoDaddy, Google Domains
   - Costo: ~$10-15/año

2. Opciones de hosting:
   - **Opción A: Emergent Deploy** (más fácil)
     - Click en "Deploy" en Emergent
     - Configura tu dominio personalizado
   
   - **Opción B: Hosting propio** (más control)
     - Railway.app, Render.com, o DigitalOcean
     - Costo: $5-20/mes

### PASO 2: Configurar Variables de Producción
```env
# backend/.env (PRODUCCIÓN)
MONGO_URL="mongodb+srv://arenasdavid1_db_user:***@cluster0.s2mz4tv.mongodb.net/?retryWrites=true&w=majority"
DB_NAME="nailcost_pro"
JWT_SECRET="[genera una clave de 64+ caracteres]"
CORS_ORIGINS="https://tudominio.com"
```

### PASO 3: Seguridad
- [ ] Cambiar JWT_SECRET a una clave única y segura
- [ ] Configurar CORS solo para tu dominio
- [ ] Habilitar HTTPS (automático en la mayoría de hosts)
- [ ] Cambiar contraseña de admin después del primer login

### PASO 4: Configurar Pagos
**Opción actual (manual):**
- Clientes pagan por Pago Móvil, Zelle, Transferencia
- Tú activas su suscripción desde el Panel Admin
- Generas factura desde Admin

**Opción futura (automático):**
- Integrar Stripe para cobros automáticos
- Renovación automática mensual

### PASO 5: Marketing Inicial
1. **Crea contenido en redes:**
   - Instagram: antes/después, tips de precios
   - TikTok: tutoriales cortos
   - WhatsApp: grupo de comunidad

2. **Ofrece trial extendido a primeros usuarios:**
   - 30 días en lugar de 15
   - Feedback a cambio de descuento

3. **Pricing sugerido Venezuela:**
   - Personal Básico: $5/mes
   - Personal Premium: $10/mes
   - Comercio Básico: $15/mes
   - Comercio Premium: $20/mes

---

## 🔐 Credenciales Admin

| Email | Password |
|-------|----------|
| admin@nailcost.pro | NailCost@Adm1n#2024Secure |

> ⚠️ Cambia esta contraseña después del primer login en producción

---

## 📱 Flujo del Usuario

```
1. Usuario se registra → Estado: PENDIENTE
2. Admin activa la cuenta → Inicia TRIAL 15 días
3. Usuario usa la app durante el trial
4. Trial vence → Usuario ve mensaje de pago
5. Usuario paga (Pago Móvil/Zelle/Transferencia)
6. Usuario contacta al admin
7. Admin registra pago → Activa suscripción
8. Usuario puede usar la app
9. Al mes siguiente → repetir desde paso 4
```

---

## 📊 Panel Admin - Funciones

| Sección | Descripción |
|---------|-------------|
| Pendientes Activación | Usuarios nuevos esperando aprobación |
| Vencidos/Espera Pago | Usuarios cuya suscripción venció |
| Usuarios Activos | Usuarios con suscripción activa |
| Facturas Pendientes | Facturas por cobrar |
| Todas las Facturas | Historial completo |

**Acciones disponibles:**
- ✅ Activar usuario (inicia trial)
- ✅ Registrar pago (activa suscripción)
- ✅ Generar factura
- ✅ Blanquear contraseña
- ✅ Suspender usuario

---

## 💡 Consejos para Crecer

1. **Primeros 10 usuarios gratis** → testimonios y feedback
2. **Programa de referidos** → 1 mes gratis por cada referido
3. **Contenido educativo** → blog/videos sobre pricing para uñas
4. **Soporte WhatsApp** → respuesta rápida = clientes felices
5. **Actualizaciones mensuales** → mantén la app fresca

---

## 🆘 Soporte

Si necesitas ayuda:
1. Revisa esta guía
2. Contacta por el canal de soporte de Emergent
3. Para cambios en la app, crea un nuevo job

¡Éxito con tu lanzamiento! 🚀
