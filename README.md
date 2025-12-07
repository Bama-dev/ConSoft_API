# 📘 README – ConSoft

## 🪑 Contexto  
**Confort & Estilo** es una empresa familiar ubicada en Medellín dedicada al diseño, fabricación y reparación de muebles, tapizado y decoración de interiores.  
El crecimiento de la empresa evidenció dificultades en la **gestión manual** de información, la **dependencia de asesores** para ventas y la **falta de automatización** de procesos clave como inventario, pedidos y pagos.

---

## ❌ Problemas Identificados
- Información gestionada en documentos físicos → riesgo de pérdida y errores.  
- Ventas limitadas al horario de atención.  
- Clientes dependientes de un asesor para compras.  
- Falta de integración entre comunicación, ventas e inventario.  
- Procesos manuales y repetitivos → baja eficiencia y productividad.  

---

## ✅ Solución: ConSoft
**ConSoft** es un **aplicativo web/móvil** diseñado para digitalizar y automatizar los procesos de Confort & Estilo.  
El software integra en una sola plataforma la **gestión de usuarios, ventas, compras, servicios, inventario y reportes**, brindando mayor eficiencia operativa y autonomía al cliente.

---

## 🎯 Objetivo General
Desarrollar una aplicación web/móvil que gestione los procesos de **compras, servicios y ventas** de la empresa Confort & Estilo, optimizando su operación y mejorando la experiencia de los clientes.

---

## 🔑 Objetivos Específicos
- Gestionar roles y permisos de acceso.  
- Administrar clientes, empleados y usuarios.  
- Digitalizar las ejemplos de productos para la fabricacion y servicios.  
- Gestionar compras, ventas, pedidos.  
- Automatizar pagos con integración de **QR** y plan separe.  
- Facilitar el **agendamiento de servicios** (fabricación, reparación, tapizado, decoración).  
- Generar reportes de desempeño (ventas, ingresos, usuarios).  

---

## ⚙️ Alcance Funcional

### 1. Configuración
- Roles y permisos.  
- Gestión de usuarios y accesos.  

### 2. Compras
- Categorías de productos de ejemplo.  
- Gestión de productos

### 3. Servicios
- Registro y actualización de servicios (fabricación, reparación, tapizado, decoración).  
- **Agendamiento de servicios (pedidos):** los clientes pueden solicitar servicios específicos y hacer seguimiento a su ejecución.  
- **Agendamiento de visitas:** permite programar visitas del equipo de la empresa al lugar del cliente para evaluar o prestar un servicio.   

### 4. Ventas
- Gestión de clientes.  
- Listado de productos de ejemplo y servicios.   
- Pagos (QR y plan separe).  


### 5. Medición y Desempeño
- Reportes de ventas, ingresos bimestrales y cantidad de usuarios.  
- Representación visual con **gráficos de barras y circulares**. 
- Reportes de productos más vendidos, etc. 
- Reportes de ventas con métricas clave.
---

## 📌 Diferenciadores frente a plataformas similares
- Enfoque **personalizado al modelo de negocio** de Confort & Estilo.  
- Gestión interna optimizada con comunicación centralizada.    
- Catálogo híbrido: **modelos predeterminados** 


## 🗄️ Scripts de base de datos (MongoDB)

En `database/` se agregan scripts para inicializar y validar el esquema en MongoDB, derivados del diagrama SQL.

- `database/schema-mapping.md`: Mapeo de tablas SQL → colecciones y referencias Mongo.
- `database/create_collections.ts`: Crea colecciones con validadores JSON Schema y opciones.
- `database/create_indexes.ts`: Crea índices y restricciones de unicidad.
- `database/seed.ts`: Inserta datos iniciales (roles, permisos, categorías, unidades, etc.).

Uso (Node >=18):

```bash
node -r ts-node/register database/create_collections.ts
node -r ts-node/register database/create_indexes.ts
node -r ts-node/register database/seed.ts
```

---

## 📚 Documentación

- Endpoints de la API: `docs/api-endpoints.md`
- Módulo de Cotizaciones: `docs/quotations.md`
- Integración móvil (React Native): `docs/mobile-integration.md`

---

## 🔐 Autenticación y permisos

- Autenticación soporta dos modalidades:
  - Cookie httpOnly (web tradicional)
  - Bearer token en header `Authorization: Bearer <token>` (móvil). El login devuelve `{ token }`.
- Rutas protegidas usan JWT más permisos por módulo/acción con `verifyRole(module, action)`.
- Permisos para cotizaciones incluidos en los seeds: `quotations.view`, `quotations.update`, `quotations.write`.

---

## 💬 Chat en tiempo real por cotización

- Cada cotización tiene su sala: `q:<quotationId>`.
- Eventos:
  - `quotation:join` → `{ quotationId }`
  - `chat:message` → `{ quotationId, message }`
- Seguridad: solo el dueño de la cotización o usuarios con permisos de cotizaciones (admin) pueden unirse y enviar.
- Historial REST: `GET /api/quotations/:quotationId/messages`
- Autenticación socket:
  - Web: puede leer la cookie httpOnly
  - Móvil: enviar `auth: { token }` en el handshake

---

## 🧾 Flujo de cotización y pedido

- Cotizar un producto (rápido): `POST /api/quotations/quick`
- Carrito de cotización (varios productos): `POST /api/quotations/cart` → agregar ítems → `POST /api/quotations/:id/submit`
- El administrador fija precio: `POST /api/quotations/:id/quote` (requiere permisos)
- El usuario acepta/rechaza: `POST /api/quotations/:id/decision`
- Si el usuario acepta, el sistema crea automáticamente un `Pedido` en estado `en_proceso` con un ítem resumen por el total estimado de la cotización.

---

## ✉️ Notificaciones por correo (opcional)

- Variables de entorno SMTP (si no se configuran, se hace no-op y no falla):
  - `MAIL_SMTP_HOST`, `MAIL_SMTP_PORT`, `MAIL_SMTP_USER`, `MAIL_SMTP_PASS`, `MAIL_FROM`, `ADMIN_NOTIFY_EMAIL`
- Correos automáticos:
  - Al fijar el precio de una cotización (al cliente)
  - Cuando el cliente acepta/rechaza (al admin)
  - En el chat: si responde un tercero (admin), se avisa al dueño

---

## 🌐 CORS y orígenes frontend

- Configurar `FRONTEND_ORIGINS` (separados por coma) para permitir los orígenes de frontend/web y móvil (si usan WebView).
- Ejemplo:
  - `FRONTEND_ORIGINS=http://localhost:3000,http://localhost:5173`

---

## 🗄️ Scripts de base de datos actualizados

- Validadores y colecciones nuevas:
  - `cotizaciones`, `cotizacion_mensajes`
- Índices:
  - Cotizaciones por usuario y fecha (`quotation_user_created_idx`)
  - Mensajes por cotización y fecha (`qmsg_quotation_sent_idx`)
- Permisos agregados en seeds:
  - `quotations.view`, `quotations.update`, `quotations.write`

---

## 🧪 Pruebas

- Ejecutar:
  ```bash
  npm ci
  npm test
  ```
- Se usa `mongodb-memory-server` para pruebas sin necesidad de una base real.

---

## 📑 OpenAPI / Swagger

- Especificación base disponible en `docs/openapi.yaml` con los endpoints principales y esquema de seguridad `bearerAuth`.


