## Permisos del sistema (por módulo)

Descripción breve de acciones:
- **view**: listar/obtener recursos (GET).
- **create**: crear recursos (POST).
- **update**: modificar recursos (PUT/PATCH).
- **delete**: eliminar recursos (DELETE).

Cada permiso se expresa como `modulo.accion` (ej.: `users.view`).

### roles
- roles.view
- roles.create
- roles.update
- roles.delete

### users
- users.view
- users.create                                                                  
- users.update
- users.delete

### categories
- categories.view
- categories.create
- categories.update
- categories.delete

### products
- products.view
- products.create
- products.update
- products.delete

### services
- services.view
- services.create
- services.update
- services.delete

### visits
- visits.view
- visits.create
- visits.update
- visits.delete

### orders
- orders.view
- orders.create
- orders.update
- orders.delete

### payments
- payments.view
- payments.create
- payments.update
- payments.delete

### sales (solo lectura)
- sales.view

### permissions
- permissions.view
- permissions.create
- permissions.update
- permissions.delete

### quotations (parcial)
- quotations.view
- quotations.update

Total esperado: 39 permisos (9 módulos con CRUD × 4 acciones = 36) + sales.view (1) + quotations.view/update (2).



