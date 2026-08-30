# Despliegue de Stetik: Render + MongoDB Atlas

Esta rama prepara Stetik para salir de Railway sin cambiar el MVP.

## Arquitectura recomendada

- Frontend React: Render Static Site (`stetik-web`)
- Backend FastAPI: Render Web Service (`stetik-api`)
- Base de datos: MongoDB Atlas
- Código: GitHub

Render puede desplegar FastAPI directamente con Uvicorn y entregar una URL pública HTTPS.

## 1. Crear MongoDB Atlas

Recomendación para pruebas y primeros usuarios: crear un proyecto separado para Stetik y un cluster Free/M0 independiente del proyecto usado por otra aplicación.

Variables:

```text
MONGO_URL=mongodb+srv://<usuario>:<password>@<cluster>/<database>?retryWrites=true&w=majority
DB_NAME=stetik_pro
```

En Atlas:

1. Crear Project: `Stetik`.
2. Crear cluster Free/M0 para validación inicial.
3. Crear un usuario de base de datos exclusivo para Stetik.
4. Crear/usar una contraseña exclusiva.
5. Configurar Network Access.
6. Copiar la cadena `mongodb+srv://...`.

Para producción con crecimiento, migrar a Flex o a un cluster dedicado sin cambiar la aplicación: solo cambia la cadena de conexión.

## 2. Crear backend en Render

Usar el repositorio `DavidCorp20/AppStetik` y la rama `hardening/mvp-production`.

Configuración manual equivalente:

- Type: Web Service
- Root Directory: `backend`
- Runtime: Python
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn production_app:app --host 0.0.0.0 --port $PORT`
- Health Check: `/health`

Variables obligatorias:

```text
MONGO_URL=<cadena de MongoDB Atlas>
DB_NAME=stetik_pro
JWT_SECRET=<secreto aleatorio largo>
CORS_ORIGINS=<URL HTTPS del frontend>
STETIK_ALLOW_UNSUBSCRIBED_ACCESS=false
STETIK_ALLOW_LEGACY_UPGRADE=false
STETIK_ALLOW_DEBUG_ENDPOINTS=false
```

No colocar secretos en GitHub.

## 3. Crear frontend

En Render:

- Type: Static Site
- Root Directory: `frontend`
- Build Command: `npm install --legacy-peer-deps && npm run build`
- Publish Directory: `build`

Variable:

```text
REACT_APP_BACKEND_URL=https://<URL-del-backend>
```

La aplicación ya usa `REACT_APP_BACKEND_URL` para construir las llamadas a `/api`.

## 4. CORS

Después de obtener la URL del frontend, volver al backend y configurar:

```text
CORS_ORIGINS=https://<URL-del-frontend>
```

Si posteriormente se conecta un dominio propio:

```text
CORS_ORIGINS=https://app.tudominio.com
```

No usar `*` en producción.

## 5. Dominio propio

Una vez comprobadas las URLs temporales:

```text
app.tudominio.com  -> frontend
api.tudominio.com  -> backend
```

Actualizar `CORS_ORIGINS` para permitir únicamente el dominio real del frontend.

## 6. Qué comprobar después del deploy

### Backend

```text
GET /health
```

Debe devolver:

```json
{"status":"ok","database":"ok"}
```

### Frontend

- Registro
- Login
- Dashboard
- Productos
- Clientes
- Citas
- Inventario
- Facturación
- Reportes
- Logout

### Seguridad

- Un usuario A no debe ver datos de B.
- Un empleado debe trabajar sobre los datos de su comercio.
- Un comercio A no debe acceder a comercio B.
- Un trial vencido debe recibir 403.
- `/api/auth/upgrade` debe permanecer bloqueado.
- Los endpoints de debug no deben estar disponibles.
- No debe haber secretos en GitHub.

## 7. Base de datos separada

No es necesario crear una cuenta MongoDB nueva para cada aplicación.

Lo recomendable es:

```text
MongoDB Atlas Organization
└── Project Stetik
    └── Cluster Stetik
        └── Database stetik_pro
```

Y para otra aplicación:

```text
MongoDB Atlas Organization
├── Project Stetik
│   └── Cluster Stetik
└── Project Cuadra
    └── Cluster Cuadra
```

Así se evita mezclar datos entre productos.

## 8. Migración desde otro cluster

Si Stetik ya tiene datos que quieres conservar, no borrar el cluster anterior hasta validar el nuevo.

Primero:

1. Crear nuevo cluster.
2. Crear usuario DB.
3. Migrar datos.
4. Probar Stetik contra el nuevo cluster.
5. Confirmar login, datos y facturación.
6. Cambiar producción.
7. Mantener el cluster anterior como respaldo temporal.

## 9. Estrategia recomendada de costos

Para validar el negocio:

```text
GitHub      -> código
Render      -> frontend + backend
Mongo Atlas -> base de datos
Dominio     -> opcional
```

No pagar infraestructura sobredimensionada hasta tener usuarios reales.

Cuando aumente el uso, escalar primero backend y MongoDB según métricas reales.
