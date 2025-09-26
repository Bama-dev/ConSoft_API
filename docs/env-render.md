## Variables de entorno para Render (copiar/pegar)

Pega este bloque en “Add from .env” dentro de Environment Variables del servicio en Render.

```env
NODE_ENV=production
MONGO_URI=
JWT_SECRET=
GOOGLE_CLIENT_ID=91663457913-110cs3ahveo1ra07dj72i4p89pt50dkt.apps.googleusercontent.com
FRONTEND_ORIGINS=https://consoft-cliente.onrender.com,http://localhost:3000

# Opcionales (si se dejan vacías, el bootstrap crea y asigna IDs en runtime)
DEFAULT_USER_ROLE_ID=
ADMIN_ROLE_ID=
```

Notas:
- No agregar `PORT` (Render lo inyecta automáticamente).
- `FRONTEND_ORIGINS` admite múltiples orígenes separados por comas.
- Mantener `JWT_SECRET` largo y aleatorio.

