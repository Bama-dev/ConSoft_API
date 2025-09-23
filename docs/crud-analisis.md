## ConSoft API — Análisis de Estructura, CRUDs y Modelos

### Resumen
La API está construida con Express y Mongoose, expone endpoints REST bajo el prefijo `/api`, y centraliza la lógica CRUD básica mediante una fábrica (`createCrudController`) que recibe un `Model` de Mongoose y devuelve handlers estándar: `list`, `get`, `create`, `update`, `remove`. Algunos controladores sobreescriben `list` para agregar `populate`, agregaciones o cálculos.

### Pila y Entry Points
- **Servidor**: `src/server.ts` crea la app con `createApp()` y levanta en `env.port` tras `connectToDatabase()`.
- **App**: `src/app.ts` configura middlewares (`express.json`, `cors`, `cookieParser`) y monta rutas en `/api`.
- **Rutas**: `src/routes/api.ts` define endpoints; utiliza `mountCrud()` para mapear controladores a rutas REST.
- **Autenticación**: `src/controllers/auth.controller.ts` (login/logout/me) + `src/middlewares/auth.middleware.ts` (JWT en cookie `token`).

### Ruteo y Convención CRUD
Archivo: `src/routes/api.ts`
- `mountCrud(path, controller)` registra:
  - GET `/${path}` → `controller.list` (si existe)
  - GET `/${path}/:id` → `controller.get`
  - POST `/${path}` → `controller.create`
  - PUT `/${path}/:id` → `controller.update`
  - DELETE `/${path}/:id` → `controller.remove`
- Endpoints de autenticación:
  - POST `/auth/login`
  - POST `/auth/logout`
  - GET `/auth/me` (protegido por `verifyToken`)

Rutas montadas y su controlador:
- `/roles` → `RoleController`
- `/users` → `UserController`
- `/categories` → `CategoryControlleer`
- `/product` → `ProductController`  ← Nota: singular, inconsistente vs plural
- `/services` → `ServiceController`
- `/visits` → `VisitController`
- `/orders` → `OrderController`
- `/payments` → `PaymentController`
- `/sales` → `SaleController`
- `/permissions` → `PermissionController`

### Fábrica CRUD (patrón base)
Archivo: `src/controllers/crud.controller.ts`
- `list`: `model.find()` devuelve array (sin `ok: true`)
- `get`: `model.findById(id)` o 404
- `create`: `model.create(body)` → 201 con el recurso
- `update`: `findByIdAndUpdate(id, body, { new: true })` o 404
- `remove`: `findByIdAndDelete(id)` → 204 o 404

Implicaciones:
- Respuesta base no sigue un formato uniforme (a veces `res.json(items)`, otras `{ ok: true, ... }` en controladores custom). Conviene unificar el contrato de respuesta.
- No incluye validación de entrada ni sanitización; la validación se delega al esquema de Mongoose y al cliente.

### Controladores y Personalizaciones
- `RoleController`
  - Hereda CRUD base y sobreescribe `list` con `populate('usersCount').populate('permissions')` y respuesta `{ ok: true, roles }`.
  - `create` valida duplicados por `name` y crea rol con `permissions`.
- `UserController`
  - Hereda CRUD base; sobreescribe `list` con `select("-password -__v")` y `populate('role', 'name description')` devolviendo `{ ok: true, users }`.
  - `create` valida email único, hashea password (`bcrypt.hash`), y crea usuario. Responde `{ message: "User registered successfully" }` (no devuelve el recurso creado).
- `CategoryControlleer`, `ProductController`, `ServiceController`, `VisitController`
  - Usan exclusivamente el CRUD base (sin `populate` ni validaciones adicionales).
- `OrderController`
  - Hereda CRUD base; sobreescribe `list` para calcular `total`, `paid`, `restante` a partir de `items.valor` y `payments.amount` y filtra solo órdenes con estado de pago pendiente.
- `PaymentController`
  - A pesar del nombre, opera sobre `OrderModel`. `list` retorna, por cada pedido, su total, pagado acumulado, restante, y los pagos transformados con campo `restante` acumulado por pago.
- `SaleController`
  - Similar a pagos, pero filtra pedidos con `restante <= 0` (ventas completadas). Popula `user` con `name`.
- `PermissionController`
  - `list` usa agregación para agrupar permisos por `module` y retorna `{ ok: true, permisos }`.

Observaciones de consistencia:
- Formato de respuesta varía entre controladores (raw array vs `{ ok: true, ... }`).
- Algunos controladores no devuelven el documento creado/actualizado de forma consistente.
- El nombre `CategoryControlleer` tiene un typo (doble "e").
- Ruta `/product` es singular; el resto usa plural.

### Modelos y Relaciones
Modelos en `src/models/`. Se usa Mongoose con convenciones mixtas en nombres de `model()` y referencias (`ref`). Hay inconsistencias importantes entre nombres de modelo y referencias.

- `RoleModel` (model: `Role`)
  - Campos: `name` (único), `description`, `status`, `permissions` (refs a `Permiso`).
  - Virtual: `usersCount` (conteo de `User` con `role` = `_id`).

- `UserModel` (model: `User`)
  - Campos: `name`, `email` (único), `password`, `profile_picture`, `document`, `address`, `phone`, `role` (ref `Role`), `status`, `registeredAt`, `favorites` (refs `Product`).

- `CategoryModel` (model: `Categoria`)
  - Campos: `name`, `description`.
  - Virtual `products`: `ref: 'products'`, `localField: '_id'`, `foreignField: 'category'`.
  - Inconsistencias: el `model` se llama `Categoria` pero `Product` referencia `ref: 'Category'` y el virtual usa `'products'` (minúscula/plural). Esto rompe `populate` si no coincide el nombre de `model`.

- `ProductModel` (model: `Producto`)
  - Campos: `name`, `description`, `category` (ref `'Category'`), `status`, `imageUrl`.
  - Inconsistencia: el `ref` debería apuntar al nombre de modelo exacto. Aquí debería ser `'Categoria'` si se pretende referenciar `CategoryModel` tal como está definido.

- `ServiceModel` (model: `Servicio`)
  - Campos: `name`, `description`, `imageUrl`, `status`.

- `VisitModel` (model: `Visit`, collection: `visitas`)
  - Campos: `user` (ref `User`), `visitDate`, `address`, `status`, `services` (array de refs `'servicios'`).
  - Inconsistencia: `services` referencia `'servicios'` pero el `ServiceModel` está registrado como `Servicio`.

- `OrderModel` (model: `Pedido`)
  - Subdocumentos: `payments` (monto/fecha/método/estado), `attachments` (url/tipo/uploader/fecha), `items` (id_servicio/detalles/valor).
  - Campos principales: `user` (ref `User`), `type`, `status`, `address`, `startedAt`, `deliveredAt`.
  - Inconsistencia: `items.id_servicio` referencia `'Service'` pero el modelo es `Servicio`.

- `PermissionModel` (model: `Permiso`)
  - Campos: `module`, `action`.

Relaciones clave:
- `User.role` → `Role` (OK)
- `Role.permissions` → `Permiso` (OK)
- `Product.category` → debería ser `Categoria` (actualmente `Category`, inconsistente)
- `Visit.services` → debería ser `Servicio` (actualmente `'servicios'`, inconsistente)
- `Order.items.id_servicio` → debería ser `Servicio` (actualmente `Service`, inconsistente)

### Autenticación y Autorización
- `AuthController.login` valida usuario y contraseña, genera JWT con `generateToken`, y lo establece en cookie `token` httpOnly.
- `verifyToken` lee cookie `token`, verifica JWT con `env.jwt_secret` y adjunta `req.user`. Se usa en `/auth/me`.
- No hay guardas de autorización por rol/permiso en los CRUD (solo autenticación en `/auth/me`).

### Flujo de Datos (CRUD típico)
1) Cliente → `POST /api/users` con payload. `UserController.create` hashea password y crea el documento.
2) Cliente → `POST /api/auth/login` → cookie `token` seteada.
3) Cliente → `POST /api/orders` crea pedido con `items` y `payments` vacíos.
4) Cliente → `PUT /api/orders/:id` para agregar pagos en `payments` y actualizar estado. `OrderController.list` y `PaymentController.list` computan `total/paid/restante`.

### Tabla de Endpoints por Recurso (derivados de `mountCrud`)
- Roles: `GET /roles`, `GET /roles/:id`, `POST /roles`, `PUT /roles/:id`, `DELETE /roles/:id`
- Users: `GET /users`, `GET /users/:id`, `POST /users`, `PUT /users/:id`, `DELETE /users/:id`
- Categories: `GET /categories`, `GET /categories/:id`, `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id`
- Product: `GET /product`, `GET /product/:id`, `POST /product`, `PUT /product/:id`, `DELETE /product/:id`
- Services: `GET /services`, `GET /services/:id`, `POST /services`, `PUT /services/:id`, `DELETE /services/:id`
- Visits: `GET /visits`, `GET /visits/:id`, `POST /visits`, `PUT /visits/:id`, `DELETE /visits/:id`
- Orders: `GET /orders`, `GET /orders/:id`, `POST /orders`, `PUT /orders/:id`, `DELETE /orders/:id`
- Payments: `GET /payments`, `GET /payments/:id`, `POST /payments`, `PUT /payments/:id`, `DELETE /payments/:id` (operan sobre `Pedido`)
- Sales: `GET /sales`, `GET /sales/:id`, `POST /sales`, `PUT /sales/:id`, `DELETE /sales/:id` (operan sobre `Pedido`)
- Permissions: `GET /permissions`, `GET /permissions/:id`, `POST /permissions`, `PUT /permissions/:id`, `DELETE /permissions/:id`
- Auth: `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`

### Hallazgos y Riesgos
- **Inconsistencia de nombres en `model()` y `ref`**: varios `ref` apuntan a nombres distintos a los registrados en `model()`. Esto romperá `populate` y relaciones en tiempo de ejecución.
- **Formato de respuestas inconsistente**: algunos endpoints devuelven arrays directos, otros un objeto con `{ ok: true }`. Esto complica clientes front.
- **Rutas no uniformes**: `/product` singular vs plural en otros recursos.
- **Nombres y typos**: `CategoryControlleer` (doble "e"), archivo `order.Controller.ts` con mayúscula intermedia.
- **Autorización**: no hay verificación de permisos por rol en operaciones sensibles (solo autenticación para `/auth/me`).

### Recomendaciones
1) Normalizar `model()` y `ref`:
   - Opción A: usar nombres en inglés y consistentes: `model('Category')`, `ref: 'Category'`, etc.
   - Opción B: mantener español pero consistente: `model('Categoria')`, `ref: 'Categoria'`, `model('Servicio')`, `ref: 'Servicio'`.
   - Corregir:
     - `Product.category` → `ref: 'Categoria'` (si se mantiene `Categoria`).
     - `CategorySchema.virtual('products')` → `ref: 'Producto'` (o el nombre de modelo real), y usar pluralización consistente.
     - `Visit.services` → `ref: 'Servicio'`.
     - `Order.items.id_servicio` → `ref: 'Servicio'`.
2) Respuesta uniforme:
   - Definir un helper de respuesta (e.g., `{ ok: true, data, meta }`) y usarlo en CRUD base y overrides.
3) Estandarizar rutas:
   - Cambiar `/product` → `/products` para alinearlo con plural.
4) Correcciones de naming/archivos:
   - Renombrar `CategoryControlleer` → `CategoryController`.
   - Renombrar `order.Controller.ts` → `order.controller.ts`.
5) Validación y sanitización:
   - Añadir validación de payloads con `zod`/`joi`/`express-validator` especialmente en `create`/`update`.
6) Autorización basada en permisos:
   - Middleware que verifique `req.user.role` y sus `permissions` antes de operaciones CRUD sensibles.

### Conclusión
La arquitectura es limpia y pragmática: una fábrica CRUD genérica reduce boilerplate y se extiende puntualmente donde hace falta lógica de negocio (roles, usuarios, pedidos, pagos, ventas, permisos). Para producción, se recomienda alinear nombres de modelos y referencias, unificar formato de respuesta y fortalecer validación/autorización para evitar errores de `populate`, inconsistencias de API y riesgos de seguridad.


