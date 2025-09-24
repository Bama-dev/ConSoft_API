## Despliegue en Render – ConSoft API

### 1) Variables de entorno (Render → Service → Settings → Environment)
Pegar estas claves (Add from .env):
```
NODE_ENV=production
MONGO_URI=mongodb+srv://USUARIO:PASS@CLUSTER/DB?retryWrites=true&w=majority
JWT_SECRET=coloca-una-clave-muy-larga-y-segura
GOOGLE_CLIENT_ID=91663457913-110cs3ahveo1ra07dj72i4p89pt50dkt.apps.googleusercontent.com
FRONTEND_ORIGINS=https://consoft-cliente.onrender.com,http://localhost:3000

# Opcionales (el bootstrap crea roles si faltan)
DEFAULT_USER_ROLE_ID=
ADMIN_ROLE_ID=
```

No agregar `PORT` (Render lo define).

### 2) Build & Start (Settings → Build & Deploy)
- Build command: `npm ci && npm run build`
- Start command: `npm run start:prod`
- Health check path: `/health`
- Auto-Deploy: Enabled desde rama `main`

### 3) Verificación
- `GET https://<tu-servicio>.onrender.com/health` → `{ ok: true }`.
- Login (Postman): `POST /api/auth/login` con `{ email, password }` → cookie httpOnly.
- Google: `POST /api/auth/google` con `{ idToken }`.
- Perfil: `GET /api/auth/me` (requiere cookie).

### 4) Conexión con Front (Next.js)
- En el front, configurar `NEXT_PUBLIC_API_URL=https://<tu-servicio>.onrender.com`.
- Hacer fetch con `credentials: 'include'` para usar la cookie httpOnly.
- Si hay CORS, añadir el dominio del front a `FRONTEND_ORIGINS` y redeploy.


