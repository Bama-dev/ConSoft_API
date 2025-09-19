// mongosh script – create collections with JSON Schema validation
// Usage: mongosh --file database/create_collections.mongo.js

const dbName = 'consoft';
db = db.getSiblingDB(dbName);

function create(name, schema) {
  if (!db.getCollectionNames().includes(name)) {
    db.createCollection(name, { validator: { $jsonSchema: schema } });
    print(`Created collection: ${name}`);
  } else {
    // Apply/refresh validator
    db.runCommand({ collMod: name, validator: { $jsonSchema: schema } });
    print(`Updated validator for: ${name}`);
  }
}

create('roles', {
  bsonType: 'object',
  required: ['name'],
  properties: {
    name: { bsonType: 'string' },
    description: { bsonType: ['string', 'null'] },
    status: { bsonType: 'bool' },
    permissions: { bsonType: 'array', items: { bsonType: 'objectId' } },
  },
});

create('permisos', {
  bsonType: 'object',
  required: ['name'],
  properties: {
    name: { bsonType: 'string' },
    description: { bsonType: ['string', 'null'] },
  },
});

create('usuarios', {
  bsonType: 'object',
  required: ['name', 'email', 'password', 'role'],
  properties: {
    name: { bsonType: 'string' },
    email: { bsonType: 'string' },
    password: { bsonType: 'string' },
    document: { bsonType: ['string', 'null'] },
    address: { bsonType: ['string', 'null'] },
    phone: { bsonType: ['string', 'null'] },
    role: { bsonType: 'objectId' },
    status: { bsonType: 'bool' },
    registeredAt: { bsonType: 'date' },
    favorites: { bsonType: 'array', items: { bsonType: 'objectId' } },
  },
});

create('categorias', {
  bsonType: 'object',
  required: ['name'],
  properties: {
    name: { bsonType: 'string' },
    description: { bsonType: ['string', 'null'] },
  },
});

create('productos', {
  bsonType: 'object',
  required: ['name', 'category'],
  properties: {
    name: { bsonType: 'string' },
    description: { bsonType: ['string', 'null'] },
    category: { bsonType: 'objectId' },
  },
});

create('servicios', {
  bsonType: 'object',
  required: ['name', 'imageUrl'],
  properties: {
    name: { bsonType: 'string' },
    description: { bsonType: ['string', 'null'] },
    imageUrl: { bsonType: ['string', 'null'] },
    status: { bsonType: 'bool' },
  },
});

create('materiales', {
  bsonType: 'object',
  required: ['name'],
  properties: { name: { bsonType: 'string' } },
});

create('unidades_medida', {
  bsonType: 'object',
  required: ['name'],
  properties: { name: { bsonType: 'string' } },
});

create('materiales_stock', {
  bsonType: 'object',
  required: ['material', 'unit', 'quantity'],
  properties: {
    material: { bsonType: 'objectId' },
    unit: { bsonType: 'objectId' },
    quantity: { bsonType: 'double' },
  },
});

create('visitas', {
  bsonType: 'object',
  required: ['user', 'scheduledAt', 'address', 'status'],
  properties: {
    user: { bsonType: 'objectId' },
    scheduledAt: { bsonType: 'date' },
    address: { bsonType: 'string' },
    status: { bsonType: 'enum', values: ['programada', 'cancelada', 'finalizada'] },
    services: {
      bsonType: 'array',
      items: {
        bsonType: 'object',
        required: ['service'],
        properties: {
          service: { bsonType: 'objectId' },
          value: { bsonType: ['double', 'int', 'long', 'double'] },
          quantity: { bsonType: ['int', 'long', 'double'] },
          notes: { bsonType: ['string', 'null'] },
        },
      },
    },
  },
});

create('pedidos', {
  bsonType: 'object',
  required: ['type', 'status'],
  properties: {
    visit: { bsonType: 'objectId' },
    type: { bsonType: 'enum', values: ['cotizacion', 'en_proceso', 'finalizado'] },
    status: { bsonType: 'string' },
    startedAt: { bsonType: ['date', 'null'] },
    deliveredAt: { bsonType: ['date', 'null'] },
    notes: { bsonType: ['string', 'null'] },
    payments: {
      bsonType: 'array',
      items: {
        bsonType: 'object',
        required: ['amount', 'paidAt', 'method', 'status'],
        properties: {
          amount: { bsonType: ['double', 'double', 'int', 'long'] },
          paidAt: { bsonType: 'date' },
          method: { bsonType: 'string' },
          status: { bsonType: 'enum', values: ['pendiente', 'confirmado', 'cancelado'] },
        },
      },
    },
    attachments: {
      bsonType: 'array',
      items: {
        bsonType: 'object',
        required: ['url', 'type', 'uploadedBy'],
        properties: {
          url: { bsonType: 'string' },
          type: { bsonType: 'string' },
          uploadedBy: { bsonType: 'objectId' },
          uploadedAt: { bsonType: 'date' },
        },
      },
    },
    usedMaterials: {
      bsonType: 'array',
      items: {
        bsonType: 'object',
        required: ['material', 'quantity', 'unitCost', 'unit'],
        properties: {
          material: { bsonType: 'objectId' },
          quantity: { bsonType: 'double' },
          unitCost: { bsonType: 'double' },
          unit: { bsonType: 'objectId' },
        },
      },
    },
  },
});

print('Done.');

