## Módulo de Cotizaciones

Objetivo
- Permitir que un cliente solicite cotización de un producto puntual o de varios productos desde un “carrito de cotización”.
- Centralizar la comunicación cliente ↔ administrador mediante chat en tiempo real, aislado por cotización.

Estados de una cotización
- `carrito`: cotización en construcción (varios ítems).
- `solicitada`: enviada por el cliente para ser cotizada.
- `en_proceso`: aceptada por el cliente; continúa el proceso (p. ej., crear pedido).
- `cotizada`: el admin fijó un precio/respuesta; pendiente decisión del cliente.
- `cerrada`: rechazada o cerrada.

Estructura de datos (resumen)
- Modelo `Cotizacion` (`src/models/quotation.model.ts`):
  - user: ref User
  - status: enum
  - items: [{ product, quantity, color, size, notes }]
  - totalEstimate?: number
  - adminNotes?: string

Flujo A: cotizar un solo producto
1) Cliente ve un producto y pulsa “Cotizar”.
2) Frontend llama `POST /api/quotations/quick` con `{ productId, quantity?, color?, size?, notes? }`.
3) Se crea la cotización con estado `solicitada`.
4) Admin revisa y responde con precio:
   - `POST /api/quotations/:id/quote` con `{ totalEstimate, adminNotes? }`. Cambia a `cotizada` y notifica por email al cliente.
5) Cliente decide:
   - `POST /api/quotations/:id/decision` con `{ decision: 'accept' | 'reject' }` → `en_proceso` o `cerrada`. Notifica al admin por email.

Flujo B: carrito de cotización (varios productos)
1) Crear/obtener carrito: `POST /api/quotations/cart`.
2) Agregar ítems: `POST /api/quotations/:id/items` (repite por cada producto).
3) Editar/eliminar: `PUT`/`DELETE /api/quotations/:id/items/:itemId`.
4) Enviar: `POST /api/quotations/:id/submit` → cambia a `solicitada`.
5) El resto del flujo es igual al A (admin `quote` y cliente `decision`).

Chat en tiempo real (tipo WhatsApp)
- Cada cotización tiene su sala: `q:<quotationId>`.
- Conexión a Socket.IO con `{ auth: { token } }` (JWT de sesión).
- Seguridad:
  - Solo el dueño de la cotización o un usuario con permisos de `quotations.view|write|update` puede unirse/enviar en la sala.
  - Al enviar `chat:message` por parte de un administrador (no dueño), se envía email al dueño con un link directo a la cotización en el frontend.

Eventos (Socket.IO)
- `quotation:join` → payload: `{ quotationId }` (valida acceso y une a sala).
- `chat:message` → payload: `{ quotationId, message }`. Persiste y emite a la sala.

Notificaciones por email
- Cuando el admin publica la cotización (precio): email al cliente con link `.../cotizaciones/:id`.
- Cuando el cliente acepta/rechaza: email al admin (`ADMIN_NOTIFY_EMAIL` o `MAIL_FROM`).
- En el chat: si responde un tercero (admin), email al dueño de la cotización.

Configuración de email (opcional)
- Variables: `MAIL_SMTP_HOST`, `MAIL_SMTP_PORT`, `MAIL_SMTP_USER`, `MAIL_SMTP_PASS`, `MAIL_FROM`, `ADMIN_NOTIFY_EMAIL`.
- Si no se configuran, el envío se omite sin romper el flujo (modo noop).

Permisos y autenticación
- Autenticación: cookie `token` (JWT).
- Permisos admin (ruta/acción):
  - Listar todas: `GET /api/quotations` → `verifyRole('quotations','view')`.
  - Fijar precio: `POST /api/quotations/:id/quote` → `verifyRole('quotations','update')`.
- El resto de operaciones son del usuario dueño (carrito, quick, decision, mine, mensajes).

Integraciones futuras (sugerencias)
- Al aceptar una cotización, crear automáticamente un `Pedido` y enlazar a pagos.
- Adjuntar archivos (referencias del cliente) a la cotización.
- Agregar impuestos/descuentos y generar PDF de cotización.


