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


