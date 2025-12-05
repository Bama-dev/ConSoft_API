## Guía Postman – ConSoft API

Base URL prod: `https://consoft-api.onrender.com`
Base URL local: `http://localhost:3000` (ajusta PORT si es distinto)

Autenticación: cookie httpOnly `token` (se setea al hacer login) o header `Authorization: Bearer <token>`. El login también retorna el `token` en el body.

### Auth
- POST {{BASE}}/api/auth/login
  - Body JSON: `{ "email": "admin@test.com", "password": "Secret123!" }`
  - Respuesta: `200 { "message": "Login successful", "token": "..." }`
  - Guarda cookie `token` automáticamente en Postman (habilita cookie jar).

- POST {{BASE}}/api/auth/google
  - Body JSON: `{ "idToken": "<ID_TOKEN_DE_GOOGLE>" }`
  - Respuesta: `200 { message: "Login successful" }`
  - Requiere `GOOGLE_CLIENT_ID` configurado en el backend.

- GET {{BASE}}/api/auth/me
  - Requiere cookie `token`.

- POST {{BASE}}/api/auth/logout
  - Limpia cookie.

### Users
- POST {{BASE}}/api/users
  - Body: `{ "name": "Juan", "email": "juan@test.com", "password": "Secret123!" }`
  - La contraseña debe tener: al menos 1 mayúscula, 1 número y 1 caracter especial.
- GET {{BASE}}/api/users
- GET {{BASE}}/api/users/:id
- PUT {{BASE}}/api/users/:id
- DELETE {{BASE}}/api/users/:id

### Roles
- CRUD en {{BASE}}/api/roles

### Catálogo público
- GET {{BASE}}/api/categories
- GET {{BASE}}/api/categories/:id
- GET {{BASE}}/api/products
- GET {{BASE}}/api/products/:id
- GET {{BASE}}/api/services
- GET {{BASE}}/api/services/:id

### Categories (protegido para crear/editar/eliminar)
- POST {{BASE}}/api/categories
  - Body: `{ "name": "Textiles", "description": "..." }`
- PUT {{BASE}}/api/categories/:id
- DELETE {{BASE}}/api/categories/:id

### Products (protegido para crear/editar/eliminar)
- POST {{BASE}}/api/products
  - Body: `{ "name": "Camisa", "category": "<categoriaId>", "description": "..." }`
- PUT {{BASE}}/api/products/:id
- DELETE {{BASE}}/api/products/:id

### Services (protegido para crear/editar/eliminar)
- POST {{BASE}}/api/services
  - Body: `{ "name": "Estampado", "description": "...", "imageUrl": "...", "status": true }`
- PUT {{BASE}}/api/services/:id
- DELETE {{BASE}}/api/services/:id

### Services / Visits
- Services CRUD en {{BASE}}/api/services
- Visits CRUD en {{BASE}}/api/visits (list/get populan `user`)

### Orders / Payments / Sales (protegido)
- Orders CRUD en {{BASE}}/api/orders
- Payments (subdocumentos de `orders`) en {{BASE}}/api/payments
  - POST body: `{ "orderId": "...", "amount": 50000, "paidAt": "2025-09-23T10:00:00.000Z", "method": "cash", "status": "confirmed" }`
- Sales (solo lectura) en {{BASE}}/api/sales

### Cotizaciones
- POST {{BASE}}/api/quotations/quick
  - Body: `{ "productId": "<productoId>", "quantity": 2, "color": "rojo", "size": "M", "notes": "..." }`
- POST {{BASE}}/api/quotations/cart
  - Crea u obtiene el carrito activo del usuario.
- POST {{BASE}}/api/quotations/:id/items
  - Body: `{ "productId": "<productoId>", "quantity": 1, "color": "negro", "size": "L", "notes": "..." }`
- PUT {{BASE}}/api/quotations/:id/items/:itemId
  - Body (parcial): `{ "quantity": 3 }`
- DELETE {{BASE}}/api/quotations/:id/items/:itemId
- POST {{BASE}}/api/quotations/:id/submit
- POST {{BASE}}/api/quotations/:id/quote (admin)
  - Body: `{ "totalEstimate": 120000, "adminNotes": "Incluye envío" }`
- POST {{BASE}}/api/quotations/:id/decision
  - Body: `{ "decision": "accept" }` | `{ "decision": "reject" }`
- GET {{BASE}}/api/quotations/mine
- GET {{BASE}}/api/quotations (admin)
- GET {{BASE}}/api/quotations/:id
- GET {{BASE}}/api/quotations/:quotationId/messages

### Notas
- Producción: cookies requieren `SameSite=None; Secure` (usa HTTPS en Postman para prod).
- Si proteges rutas con auth, asegúrate de que Postman envíe la cookie.


