# SQL → MongoDB (ConSoft)

Este documento mapea el esquema SQL proporcionado al modelo MongoDB, siguiendo el contexto de ConSoft (roles/permiso, usuarios, catálogo, servicios, visitas y pedidos).

## Principios
- Relaciones 1:N y N:1 con referencias (`ObjectId`).
- Tablas puente y detalles consultados junto al padre como documentos embebidos.
- Índices para unicidad y consultas frecuentes.

## Mapeo
- roles → colección `roles`
  - nombre → `name: string` (req)
  - descripcion → `description: string`
  - estado → `status: boolean` (default true)
  - N:M permisos → `permissions: ObjectId[]` (ref `permisos`)

- permisos → colección `permisos`
  - nombre → `name: string` (req)
  - descripcion → `description: string`

- usuarios → colección `usuarios`
  - nombre → `name: string` (req)
  - correo [unique] → `email: string` (req, unique)
  - contraseña → `password: string` (req)
  - documento → `document: string`
  - direccion → `address: string`
  - telefono → `phone: string`
  - rol → `role: ObjectId` (ref `roles`, req)
  - estado → `status: boolean` (default true)
  - fecha_registro → `registeredAt: date` (default now)
  - destacados → `favorites: ObjectId[]` (ref `productos`)

- categorias → colección `categorias`
  - nombre → `name: string` (req)
  - descripcion → `description: string`

- productos → colección `productos`
  - nombre → `name: string` (req)
  - descripcion → `description: string`
  - categoria → `category: ObjectId` (ref `categorias`, req)

- servicios → colección `servicios`
  - nombre → `name: string` (req)
  - descripcion → `description: string`
  - url_imagen → `imageUrl: string` (req)
  - estado → `status: boolean` (default true)

- materiales → colección `materiales`
  - nombre → `name: string` (req)

- unidades_medida → colección `unidades_medida`
  - nombre → `name: string` (req)

- materiales_stock → colección `materiales_stock`
  - id_material → `material: ObjectId` (req)
  - id_unidad → `unit: ObjectId` (req)
  - cantidad → `quantity: double` (req)
  - PK compuesta → índice único `{ material: 1, unit: 1 }`

- visitas → colección `visitas`
  - id_usuario → `user: ObjectId` (req)
  - fecha_programacion → `scheduledAt: date` (req)
  - direccion → `address: string` (req)
  - estado → `status: enum('programada','cancelada','finalizada')` (req)
  - visitas_servicios → `services: [{ service: ObjectId, value?: number, quantity?: number, notes?: string }]` (embebido)

- pedidos → colección `pedidos`
  - id_visita [unique] → `visit: ObjectId` (unique) 
  - tipo → `type: enum('cotizacion','en_proceso','finalizado')` (req)
  - estado → `status: string` (req)
  - fecha_inicio → `startedAt: date`
  - fecha_entrega → `deliveredAt: date`
  - notas → `notes: string`
  - pagos_pedidos → `payments: [{ amount: number, paidAt: date, method: string, status: enum('pendiente','confirmado','cancelado') }]` (embebido)
  - archivos_adjuntos → `attachments: [{ url: string, type: string, uploadedBy: ObjectId, uploadedAt: date }]` (embebido)
  - materiales_utilizados → `usedMaterials: [{ material: ObjectId, quantity: double, unitCost: double, unit: ObjectId }]` (embebido)

## Colecciones embebidas (desaparecen):
- roles_permisos → `roles.permissions`
- destacados → `usuarios.favorites`
- visitas_servicios → `visitas.services`
- pagos_pedidos → `pedidos.payments`
- archivos_adjuntos → `pedidos.attachments`
- materiales_utilizados → `pedidos.usedMaterials`

## Índices clave
- `usuarios.email` unique
- `materiales_stock (material, unit)` unique
- `pedidos.visit` unique (sparse)

> Usa los scripts `.mongo.js` para crear colecciones, restricciones e inserts.
