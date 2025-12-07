## Guía de Integración para Móvil (React Native)

Esta guía resume cómo autenticarte, consumir endpoints y usar el chat en tiempo real desde una app móvil (React Native). Incluye ejemplos con `fetch` y `socket.io-client`.

### Base URL y CORS
- Backend expone API bajo `/api`. Ejemplo: `http://<HOST>:<PORT>/api`
- Asegúrate de agregar el origen móvil (si usas WebView) en `FRONTEND_ORIGINS`. Para apps nativas usando Bearer token no es necesario.

### Autenticación
- Soportadas dos modalidades:
  - Cookie httpOnly (web): el backend setea `token` en cookie.
 - Cookie httpOnly (móvil/web): el backend setea `token` en cookie; no retorna token en el body.

Endpoints
- POST `/api/auth/login` → body: `{ email, password }` → response: `{ message }` y Set-Cookie `token` (httpOnly).
- GET `/api/auth/me` → requiere autenticación (cookie o Bearer).
- POST `/api/auth/logout` → limpia cookie (en Bearer, descarta el token del lado del cliente).
- Registro público: POST `/api/users` → `{ name, email, password }` (asigna rol por defecto).
  - La contraseña debe incluir al menos 1 mayúscula, 1 número y 1 caracter especial.

Ejemplo React Native (login + guardar token)
```javascript
const API = 'http://<HOST>:<PORT>';

async function login(email, password) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // para enviar/recibir cookies
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || data?.message || 'Login failed');
  return true; // cookie httpOnly queda guardada por el cliente (según plataforma)
}

async function fetchMe() {
  const res = await fetch(`${API}/api/auth/me`, { credentials: 'include' });
  return await res.json();
}
```

### Convenciones de petición/respuesta
- Enviar `Content-Type: application/json` para POST/PUT con body JSON.
- Errores: HTTP 4xx/5xx con `{ message | error }`.
- Paginación: no aplica por defecto (endpoints devuelven colecciones completas según el recurso).

### Catálogo público (sin autenticación)
- Categorías
  - GET `/api/categories`
  - GET `/api/categories/:id`
- Productos
  - GET `/api/products`
  - GET `/api/products/:id`
- Servicios
  - GET `/api/services`
  - GET `/api/services/:id`

Ejemplos React Native (catálogo)
```javascript
async function listProducts() {
  const res = await fetch(`${API}/api/products`);
  if (!res.ok) throw new Error('Error listing products');
  return await res.json(); // { ok: true, products }
}

async function getCategory(id) {
  const res = await fetch(`${API}/api/categories/${id}`);
  if (!res.ok) throw new Error('Error getting category');
  return await res.json();
}
```

### Productos
- GET `/api/products` → lista de productos (con categoría).
- GET `/api/products/:id` → detalle de producto.

### Cotizaciones (dos flujos)

Flujo A – Cotizar un solo producto (desde su ficha)
- POST `/api/quotations/quick` → `{ productId, quantity?, color?, size?, notes? }`
  - Valida que `quantity > 0` si se envía.
  - Crea cotización con estado `solicitada`.
- GET `/api/quotations/mine` → cotizaciones del usuario autenticado.
- GET `/api/quotations/:id` → detalle.
- Admin fija precio: POST `/api/quotations/:id/quote` → `{ totalEstimate, adminNotes? }` (requiere permisos admin)
- Usuario decide: POST `/api/quotations/:id/decision` → `{ decision: 'accept' | 'reject' }`

Flujo B – Carrito de cotización (varios productos)
- POST `/api/quotations/cart` → obtiene/crea carrito (`status: 'carrito'`).
- POST `/api/quotations/:id/items` → agrega ítem `{ productId, quantity?, color?, size?, notes? }` (valida `quantity > 0`).
- PUT `/api/quotations/:id/items/:itemId` → edita ítem (valida `quantity > 0` si se envía).
- DELETE `/api/quotations/:id/items/:itemId` → elimina ítem.
- POST `/api/quotations/:id/submit` → envía cotización (`status: 'solicitada'`).

Ejemplos React Native (cotizar rápido y carrito)
```javascript
async function quoteQuick(token, productId, options) {
  const res = await fetch(`${API}/api/quotations/quick`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, ...options }), // { quantity?, color?, size?, notes? }
  });
  return await res.json();
}

async function addToCart(token, quotationId, productId, options) {
  const res = await fetch(`${API}/api/quotations/${quotationId}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, ...options }),
  });
  return await res.json();
}
```

### Reglas de negocio relevantes para móvil
- Carrito único por usuario: solo puede existir 1 carrito activo (`status: 'carrito'`) por usuario. El endpoint `/api/quotations/cart` hace creación/obtención atómica (no necesitas validar en cliente).
- Decisión final (aceptar/rechazar):
  - POST `/api/quotations/:id/decision` → `{ decision: 'accept' | 'reject' }`
  - Si aceptas, se crea automáticamente un `Order` si no existe uno reciente.
  - En ambos casos (accept/reject), se eliminan la cotización y sus mensajes de chat en la BD.
  - Respuesta:
    ```json
    { "ok": true, "deleted": true, "quotationId": "<id>" }
    ```
  - Consideración en la app: después de decidir, no vuelvas a consultar la misma cotización; refresca la lista (`/api/quotations/mine`).

### Chat en tiempo real (por cotización)
- Librería cliente: `socket.io-client`
- Seguridad: solo dueño de la cotización o admin con permisos `quotations.view|write|update` puede unirse y enviar mensajes.
- Eventos:
  - `quotation:join` → `{ quotationId }`
  - `chat:message` → `{ quotationId, message }` (servidor emite a la sala `q:<quotationId>`).
- Historial REST: GET `/api/quotations/:quotationId/messages`

Ejemplo React Native (Socket.IO)
```javascript
import { io } from 'socket.io-client';

const socket = io(API, {
  transports: ['websocket'],
  auth: { token }, // Recomendado en RN (sin cookies)
});

socket.on('connect', () => {
  socket.emit('quotation:join', { quotationId });
});

socket.on('chat:message', (msg) => {
  // { _id, quotation, sender, message, sentAt }
  // Actualiza UI del chat
});

function sendMessage(quotationId, message) {
  socket.emit('chat:message', { quotationId, message });
}
```

### Otros recursos (resumen)
- Categorías:
  - GET `/api/categories`, GET `/api/categories/:id`.
  - POST `/api/categories` → requiere `name` (rol admin).
- Servicios:
  - GET `/api/services`, GET `/api/services/:id`.
  - POST `/api/services` → requiere `name` (rol admin).
- Roles/Permisos (admin):
  - Roles: CRUD; `name` requerido al crear.
  - Permisos: POST requiere `{ module, action }`.
- Pedidos/Pagos:
  - GET `/api/orders`, GET `/api/orders/:id` (cálculos de `total`, `paid`, `restante`).
  - GET `/api/payments`, GET `/api/payments/:id` (con cálculo de `restante`).

### Reglas y respuestas
- Validaciones más relevantes:
  - Producto: `name` y `category` requeridos en POST.
  - Categoría: `name` requerido.
  - Servicio: `name` requerido.
  - Cotización:
    - `quantity > 0` en quick/add/update si se envía.
    - `totalEstimate >= 0` en `quote` (admin).
- Decisión:
  - Al aceptar o rechazar una cotización, el backend elimina la cotización y sus mensajes asociados.
- Respuestas de éxito: 200/201 con payload del recurso.
- Errores: 400 (validación), 401 (no autenticado), 403 (sin permisos), 404 (no encontrado), 500 (servidor).

### Buenas prácticas en RN
- Usa una librería de manejo de cookies (ej. `react-native-cookies`) para gestionar cookies httpOnly si tu runtime no lo hace automáticamente.
- En caso de usar WebView, asegúrate que comparte cookies con el contexto nativo.
- Gestiona expiración (401 → re-login).
- Para Socket.IO en RN, sigue autenticando por `auth: { token }` si tu app obtiene el token por otros medios seguros. El backend no lo expone en el body de login.

### Referencias
- Endpoints detallados: `docs/api-endpoints.md`
- Flujo de Cotizaciones: `docs/quotations.md`


