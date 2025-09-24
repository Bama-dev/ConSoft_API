## Guía Postman – ConSoft API

Base URL prod: `https://consoft-api.onrender.com`
Base URL local: `http://localhost:3000` (ajusta PORT si es distinto)

Usa cookie httpOnly `token` para autenticación. Login setea la cookie; no se retorna el JWT en el body.

### Auth
- POST {{BASE}}/api/auth/login
  - Body JSON: `{ "email": "admin@test.com", "password": "secret123" }`
  - Respuesta: `200 { message: "Login successful" }`
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
  - Body: `{ "name": "Juan", "email": "juan@test.com", "password": "secret123" }`
- GET {{BASE}}/api/users
- GET {{BASE}}/api/users/:id
- PUT {{BASE}}/api/users/:id
- DELETE {{BASE}}/api/users/:id

### Roles
- CRUD en {{BASE}}/api/roles

### Categories / Product
- Categories CRUD en {{BASE}}/api/categories
- Products CRUD en {{BASE}}/api/product

### Services / Visits
- Services CRUD en {{BASE}}/api/services
- Visits CRUD en {{BASE}}/api/visits (list/get populan `user`)

### Orders / Payments / Sales
- Orders CRUD en {{BASE}}/api/orders
- Payments (subdocumentos de `orders`) en {{BASE}}/api/payments
  - POST body: `{ "orderId": "...", "amount": 50000, "paidAt": "2025-09-23T10:00:00.000Z", "method": "cash", "status": "confirmed" }`
- Sales (solo lectura) en {{BASE}}/api/sales

### Notas
- Producción: cookies requieren `SameSite=None; Secure` (usa HTTPS en Postman para prod).
- Si proteges rutas con auth, asegúrate de que Postman envíe la cookie.


