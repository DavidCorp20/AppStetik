# Guía de Lanzamiento - Stetik

## Estado del MVP

| Componente | Estado |
|---|---|
| Autenticación | ✅ |
| UX Persona/Comercio | ✅ |
| Panel Admin | ✅ |
| Activación de usuarios | ✅ |
| Trial 15 días | ✅ |
| Suscripciones | ✅ |
| Inventario | ✅ |
| Facturación | ✅ |
| Reportes | ✅ |
| MongoDB Atlas | ✅ |
| Entrypoint de producción endurecido | ✅ |

> El branch `hardening/mvp-production` agrega una capa de producción sin reemplazar el MVP existente.

## 1. Variables de producción

Configura las siguientes variables **en el proveedor de hosting**, no dentro de Git:

```env
MONGO_URL="mongodb+srv://<usuario>:<password>@<cluster>/?retryWrites=true&w=majority"
DB_NAME="stetik_pro"
JWT_SECRET="<clave aleatoria de al menos 64 caracteres>"
CORS_ORIGINS="https://tu-dominio.com"
STETIK_ALLOW_UNSUBSCRIBED_ACCESS="false"
STETIK_ALLOW_LEGACY_UPGRADE="false"
STETIK_ALLOW_DEBUG_ENDPOINTS="false"
```

### Reglas

- Nunca commits de `MONGO_URL`, contraseñas o JWT secrets.
- Rota cualquier credencial que haya estado previamente en el repositorio.
- Usa un usuario MongoDB exclusivo para producción.
- Restringe MongoDB a las redes necesarias.
- HTTPS obligatorio en producción.

## 2. Backend de producción

El branch incluye:

```text
backend/production_app.py
backend/Procfile
Procfile
```

El arranque recomendado es:

```bash
cd backend
uvicorn production_app:app --host 0.0.0.0 --port $PORT
```

El wrapper añade:

- Validación centralizada de cuenta/trial/suscripción.
- Validación de la suscripción del comercio para empleados.
- Bloqueo del endpoint de upgrade directo sin pago.
- Bloqueo de endpoints de debug de recuperación de contraseña.
- Headers de seguridad HTTP.

El `server.py` original se mantiene para facilitar rollback y desarrollo.

## 3. Flujo comercial seguro

```text
Registro
   ↓
PENDING
   ↓
Admin activa
   ↓
TRIAL 15 días
   ↓
Pago manual / futuro gateway
   ↓
Admin registra pago
   ↓
Suscripción activa
   ↓
Acceso
   ↓
Vencimiento
   ↓
Bloqueo de API
```

El endpoint de upgrade directo de desarrollo permanece deshabilitado en producción.

## 4. Pagos

### Etapa MVP

- Pago Móvil
- Zelle
- Transferencia
- Activación manual desde Admin

### Etapa posterior

Integrar gateway de pago y activar la suscripción solamente después de confirmar el pago mediante webhook o mecanismo equivalente.

## 5. Pricing inicial

- Personal Básico: $5/mes
- Personal Premium: $10/mes
- Comercio Básico: $15/mes
- Comercio Premium: $20/mes

Los precios son comerciales; la lógica técnica de suscripción debe seguir siendo la autoridad del backend.

## 6. Checklist antes de producción

- [ ] Rotar JWT_SECRET
- [ ] Rotar credenciales MongoDB si fueron usadas anteriormente en documentación
- [ ] Configurar CORS con dominios reales
- [ ] Configurar HTTPS
- [ ] Configurar `production_app:app`
- [ ] Verificar trial expirado → API devuelve 403
- [ ] Verificar suscripción vencida → API devuelve 403
- [ ] Verificar empleado con comercio vencido → API devuelve 403
- [ ] Verificar upgrade directo → 410
- [ ] Verificar endpoints debug → 404
- [ ] Probar aislamiento Comercio A vs Comercio B
- [ ] Probar owner/admin/empleado
- [ ] Hacer backup inicial de MongoDB
- [ ] Confirmar logs y monitoreo

## 7. Credenciales administrativas

**No se almacenan credenciales administrativas en este repositorio.**

Crea o rota el usuario administrador directamente en el entorno de producción y guarda sus credenciales en un gestor seguro.

## 8. Rollback

El MVP original continúa disponible mediante `backend/server.py`.

Si el proveedor no soporta el `Procfile`, configura manualmente el start command:

```bash
cd backend && uvicorn production_app:app --host 0.0.0.0 --port $PORT
```

No cambies la arquitectura del MVP para resolver problemas de despliegue; primero verifica variables de entorno, root directory y start command.
