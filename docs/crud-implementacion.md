## ConSoft API — Implementación y Guía de CRUDs (Permisos, Visitas, Sales)

Este documento describe qué hace cada cambio, los endpoints resultantes, ejemplos de request/response y consideraciones para conectar con el frontend.

### 1) Permisos
Archivo(s): `src/models/permission.model.ts`, `src/controllers/permission.controller.ts`

- Índice único compuesto `{ module, action }` para evitar duplicados.
- `create` valida existencia previa y retorna 409 si existe.
- `update` maneja colisión única y retorna 409 si aplica.
- `list` agrupa por `module` y retorna `{ ok: true, permisos }` (estructura previa preservada).

Endpoints:
- GET `/api/permissions` → lista agrupada por módulo
- GET `/api/permissions/:id` → obtiene un permiso (respuesta directa del documento)
- POST `/api/permissions` → crea `{ module, action }`
- PUT `/api/permissions/:id` → actualiza `{ module?, action? }`
- DELETE `/api/permissions/:id` → elimina

Ejemplo create (POST `/api/permissions`):
Body:
```json
{ "module": "users", "action": "create" }
```
Posibles respuestas:
- 201 `{ _id, module, action }`
- 409 `{ message: "Permission already exists for this module/action" }`
- 400 `{ message: "module is required" }`

Notas Frontend:
- Manejar 409 para mostrar feedback de duplicado.
- `GET /api/permissions` devuelve objeto con `{ ok, permisos }`. Cada item contiene `module` y `permissions[]` dentro.

---

### 2) Visitas
Archivo(s): `src/controllers/visit.controller.ts`

- `list` hace `populate('user', 'name email')` y `populate('services')`, responde `{ ok: true, visits }` para facilitar UI.
- `get` retorna el documento con `user` y `services` populados.
- `create/update/remove` usan el CRUD base (estructura previa preservada).

Endpoints:
- GET `/api/visits`
- GET `/api/visits/:id`
- POST `/api/visits`
- PUT `/api/visits/:id`
- DELETE `/api/visits/:id`

Ejemplo create (POST `/api/visits`):
Body:
```json
{
  "user": "<userId>",
  "visitDate": "2025-09-23T10:00:00.000Z",
  "address": "Calle 123",
  "status": "scheduled",
  "services": ["<serviceId>"]
}
```
Respuesta:
- 201 `{ ...documento }`

Notas Frontend:
- En list ya llegan `user.name/email` y `services[]` resueltos, ahorra llamadas extra.
- Validar fecha y que `user`/`services` existan en colecciones relacionadas.

---

### 3) Sales (derivado de Orders)
Archivo(s): `src/controllers/sales.controller.ts`

- Ventas son derivadas: solo existen pedidos con `restante <= 0`.
- `list` calcula para cada `order`: `total`, `paid`, `restante` y filtra las completadas.
- `get` retorna una venta si su pedido está completamente pagado.
- `create/update/remove` responden 405 (no se puede crear/editar/eliminar ventas directamente).

Endpoints:
- GET `/api/sales` → lista de ventas derivadas
- GET `/api/sales/:id` → venta específica si está completada
- POST/PUT/DELETE `/api/sales` → 405 (no permitido)

Ejemplo respuesta list:
```json
{
  "ok": true,
  "sales": [
    { "_id": "<orderId>", "total": 100000, "paid": 100000, "restante": 0, "user": { "_id": "...", "name": "Juan" } }
  ]
}
```

Notas Frontend:
- Usar `/api/sales` para tableros de ventas completadas.
- Acciones para completar una venta deben realizarse sobre `/api/orders/:id` agregando pagos hasta que `restante` sea 0.
- Manejar 405 si por error se intenta crear/editar ventas.

---

### 4) Payments (subdocumentos dentro de Orders)
Archivo(s): `src/controllers/payment.controller.ts`

- `list` resume pagos por pedido e incluye `total/paid/restante` con acumulado por pago.
- `get` devuelve el resumen de pagos para un pedido específico (`:id` es el `orderId`).
- `create` agrega un pago al arreglo `payments` de un pedido.
- `update` actualiza un pago usando `orderId` en la URL (`:id`) y `paymentId` en el body.
- `remove` elimina un pago de un pedido usando `orderId` y `paymentId`.

Endpoints:
- GET `/api/payments` → resumen de todos los pedidos
- GET `/api/payments/:id` → resumen de un pedido (id = orderId)
- POST `/api/payments` → crear pago
- PUT `/api/payments/:id` → actualizar pago (id = orderId)
- DELETE `/api/payments/:id` → eliminar pago (id = orderId)

Create (POST `/api/payments`):
Body:
```json
{ "orderId": "<orderId>", "amount": 50000, "paidAt": "2025-09-23T10:00:00.000Z", "method": "cash", "status": "confirmed" }
```
Respuestas:
- 201 `{ _id, amount, paidAt, method, status }`
- 404 `{ message: "Order not found" }`
- 400 `{ message: "orderId, amount, paidAt, method, status are required" }`

Update (PUT `/api/payments/:id` donde `:id` es `orderId`):
Body:
```json
{ "paymentId": "<paymentId>", "amount": 70000 }
```
- 200 `{ ...paymentActualizado }`
- 404 `{ message: "Order or payment not found" }`

Delete (DELETE `/api/payments/:id` donde `:id` es `orderId`):
Body:
```json
{ "paymentId": "<paymentId>" }
```
- 204 sin contenido
- 404 `{ message: "Order not found" }`

Notas Frontend:
- Tras crear/actualizar/eliminar pagos, refrescar `/api/orders` o `/api/payments` para recalcular `restante`.
- Cuando `restante` llega a 0, el pedido aparecerá en `/api/sales` automáticamente.

### Contratos y Consistencia de Respuesta
- Controladores base devuelven documentos/arrays directos.
- Overrides (`permissions`, `visits`, `sales`) devuelven `{ ok: true, ... }`.
- Recomendación: acordar en frontend un adapter para normalizar respuestas si es necesario.

### Autenticación
- Actualmente solo `/api/auth/me` usa `verifyToken`. Si el frontend requiere protección para CRUDs, envolver llamadas con cookie `token` y añadir el middleware a rutas que se necesiten proteger.

### Próximos pasos sugeridos
- Añadir validación de payload (`zod`/`express-validator`) en `create/update`.
- Documentar errores estándar (400/401/403/404/409/500) y formatos de respuesta.


