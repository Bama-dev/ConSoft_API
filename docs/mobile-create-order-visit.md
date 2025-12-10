# Endpoints móviles para crear y consultar pedidos y visitas (asignados al usuario)

Requieren sesión (cookie httpOnly `token`). No necesitan permisos de admin.

## Pedidos (Orders)

### POST `/api/orders/mine` — Crear pedido para el usuario autenticado
Body:
```json
{
  "items": [
    { "id_servicio": "<serviceId>", "detalles": "Texto", "valor": 120000 }
  ],
  "address": "Calle 123 #45-67, Ciudad"
}
```
Notas:
- Asigna automáticamente el `user` con el `id` del usuario autenticado.
- `status` se inicializa en `"en_proceso"` y `startedAt` en la fecha actual.
- Respuesta: `201 { "ok": true, "order": { ... } }` con `user` e `items.id_servicio` populados.

### GET `/api/orders/mine` — Listar pedidos del usuario autenticado
Respuesta:
```json
{
  "ok": true,
  "orders": [
    {
      "_id": "...",
      "user": { "_id": "...", "name": "...", "email": "..." },
      "status": "en_proceso",
      "items": [{ "id": "...", "id_servicio": { "_id": "...", "name": "..." }, "detalles": "...", "valor": 120000 }],
      "total": 120000,
      "paid": 0,
      "restante": 120000,
      "paymentStatus": "Pendiente"
    }
  ]
}
```

## Visitas (Visits)

### POST `/api/visits/mine` — Crear visita para el usuario autenticado
Body:
```json
{
  "visitDate": "2025-12-31T10:00:00.000Z",
  "address": "Calle 123 #45-67, Ciudad",
  "status": "pendiente",
  "services": ["<serviceId1>", "<serviceId2>"]
}
```
Notas:
- `user` se asigna automáticamente al usuario autenticado.
- `status` por defecto `"pendiente"` si no se envía.
- Respuesta: `201 { "ok": true, "visit": { ... } }` con `user` y `services` populados.

### GET `/api/visits/mine` — Listar visitas del usuario autenticado
Respuesta:
```json
{
  "ok": true,
  "visits": [
    {
      "_id": "...",
      "user": { "_id": "...", "name": "...", "email": "..." },
      "visitDate": "2025-12-31T10:00:00.000Z",
      "address": "Calle 123 #45-67, Ciudad",
      "status": "pendiente",
      "services": [{ "_id": "...", "name": "...", "description": "..." }]
    }
  ]
}
```

## Consideraciones
- Todos los endpoints anteriores requieren autenticación por cookie httpOnly (`/api/auth/login` antes).
- Si tu app móvil no comparte cookies automáticamente, usa un wrapper que incluya `credentials: 'include'` en cada request.
- Para producción, asegúrate de exponer el mismo dominio o configurar correctamente `FRINTE

