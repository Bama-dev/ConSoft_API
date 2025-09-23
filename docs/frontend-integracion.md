## Integración con Frontend

### Base URL de la API (producción)
- Usa esta URL como base en el frontend: `https://consoft-api.onrender.com`
- Ejemplo (Next.js): en `.env.local` del front
```
NEXT_PUBLIC_API_URL=https://consoft-api.onrender.com
```

### CORS
- Configurar `FRONTEND_ORIGINS` en `.env`, ejemplo:
```
FRONTEND_ORIGINS=http://localhost:3000,https://miapp.com
```

### Autenticación
- Login: `POST /api/auth/login` body `{ email, password }` → respuesta `{ accessToken }` y cookie `token` httpOnly.
- Autorización: enviar `Authorization: Bearer <accessToken>` en llamadas protegidas. La cookie también es aceptada.
- Perfil: `GET /api/auth/me` (requiere token/cookie).

### Ejemplo con fetch
```js
async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json().catch(() => ({}));
}
```

### Flujos clave
- Registro → `POST /api/users` con `{ name, email, password }`.
- Login → guardar `accessToken` en memoria (no LocalStorage si se puede evitar) y usar cookie httpOnly.
- Pedidos → `POST /api/orders` y luego `POST /api/payments` hasta que `restante` sea 0 (aparece en `/api/sales`).
- Visitas → CRUD en `/api/visits` (list/get ya trae `user` populado).
- Permisos → CRUD en `/api/permissions` (evita duplicados).

### Manejo de respuestas
- Algunos endpoints devuelven `{ ok: true, ... }` (e.g., `roles`, `permissions`, `sales`, `payments(list)`, `visits(list)`), otros devuelven arrays/objetos directos (CRUD base). Ajustar un adapter en el front si es necesario.


