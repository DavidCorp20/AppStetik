# NailCost Pro - Checklist de Producción

## Fecha: 11 Marzo 2026

---

## 1. Deploy del Backend
**Estado: OK**

- ✅ Backend ejecutándose en FastAPI con Uvicorn
- ✅ HTTPS activo (certificado SSL válido)
- ✅ Variables de entorno configuradas
- ✅ Rate limiting implementado
- ✅ Sanitización de inputs activa

---

## 2. Deploy del Frontend
**Estado: OK**

- ✅ React app compilada correctamente
- ✅ URL del backend configurada en .env
- ✅ Componentes UI funcionando (Shadcn/UI)
- ✅ Rutas protegidas con autenticación

---

## 3. Conexión a Base de Datos
**Estado: OK**

- ✅ MongoDB Atlas conectado y funcionando
- ✅ Datos persistiendo correctamente
- ✅ Backups automáticos activos (incluidos en Atlas)
- ✅ Usuarios, productos, estilos, clientes guardándose

---

## 4. Dominio
**Estado: ACTION REQUIRED**

Actualmente usa: `salon-margin-tool.preview.emergentagent.com`

Para producción necesitas:
1. Comprar dominio (ej: nailcost.pro) - ~$12/año en Namecheap/GoDaddy
2. Configurar DNS apuntando al servidor
3. Actualizar REACT_APP_BACKEND_URL en frontend

---

## 5. Variables de Entorno
**Estado: OK (con recomendación)**

Backend (.env):
- ✅ MONGO_URL - Configurada
- ✅ DB_NAME - Configurada
- ✅ JWT_SECRET - Configurada (cambiar en producción)
- ⚠️ CORS_ORIGINS - Actualmente "*", restringir en producción

Frontend (.env):
- ✅ REACT_APP_BACKEND_URL - Configurada

---

## 6. Build App Móvil (Android)
**Estado: ACTION REQUIRED**

No está configurado Capacitor. Pasos necesarios:

```bash
# En /app/frontend
yarn add @capacitor/core @capacitor/cli @capacitor/android
npx cap init "NailCost Pro" "com.nailcost.pro"
npx cap add android
yarn build
npx cap sync android
```

---

## 7. Publicación Play Store
**Estado: ACTION REQUIRED**

Requisitos:
1. Cuenta Google Play Developer - $25 USD (pago único)
2. Generar keystore para firmar APK
3. Crear assets: ícono 512x512, screenshots, descripción
4. Política de privacidad (URL pública)
5. Generar AAB (Android App Bundle)

---

## 8. Persistencia de Datos
**Estado: OK**

Verificado que se guardan correctamente:
- ✅ Usuarios (21 en BD)
- ✅ Productos (21 items)
- ✅ Estilos/Servicios (8 items)
- ✅ Clientes (8 items)
- ✅ Pagos
- ✅ Facturas
- ✅ Gastos

---

## 9. Logs y Monitoreo
**Estado: OK**

- ✅ Logs en /var/log/supervisor/backend.*.log
- ✅ Errores capturados y registrados
- ⚠️ Recomendación: Agregar Sentry para monitoreo en producción

---

## 10. Resumen Final

### ✅ LISTO (6 items)
1. Backend desplegado y funcionando
2. Frontend desplegado y funcionando
3. Base de datos conectada con backups
4. Variables de entorno configuradas
5. Persistencia de datos verificada
6. Sistema de logs activo

### 🔧 ARREGLADO POR EL SISTEMA (2 items)
1. JWT expiración reducida a 24h
2. Sanitización XSS agregada

### ⚡ ACCIÓN REQUERIDA (4 items)
1. **Dominio** - Comprar y configurar DNS
2. **CORS** - Restringir a tu dominio
3. **App Android** - Configurar Capacitor
4. **Play Store** - Crear cuenta developer

---

## Pasos Finales para Lanzar MVP

### Opción A: Solo Web (Inmediato)
1. Comprar dominio ($12/año)
2. Configurar DNS
3. Actualizar CORS_ORIGINS en backend
4. ¡Lanzar!

### Opción B: Web + Android (1-2 semanas)
1. Todo lo anterior +
2. Configurar Capacitor
3. Crear cuenta Google Play ($25)
4. Generar keystore y AAB
5. Subir a Play Store (revisión 3-7 días)

---

## Credenciales de Prueba
| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@nailcost.pro | NailCost@Adm1n#2024Secure |
| Comercio | elite.nails@test.com | Test123! |
| Personal | maria.nails@test.com | Test123! |

---

## URLs Actuales
- App: https://salon-margin-tool.preview.emergentagent.com
- Presentación Persona: /presentacion-persona.html
- Presentación Comercio: /presentacion-comercio.html
