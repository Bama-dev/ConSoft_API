// mongosh script – insert seed data (idempotent-ish)
// Usage: mongosh --file database/seed_inserts.mongo.js

const dbName = 'consoft';
db = db.getSiblingDB(dbName);

function upsertByName(coll, doc) {
  const existing = db[coll].findOne({ name: doc.name });
  if (existing) {
    return existing._id;
  }
  const res = db[coll].insertOne(doc);
  return res.insertedId;
}

// Permissions
const permNames = [
  'users.read',
  'users.write',
  'catalog.read',
  'catalog.write',
  'orders.read',
  'orders.write',
];
const permIds = permNames.map((p) => upsertByName('permisos', { name: p, description: '' }));

// Roles
const adminRoleId = upsertByName('roles', { name: 'Administrador', description: 'Acceso total', status: true, permissions: permIds });
const userRoleId = upsertByName('roles', { name: 'Cliente', description: 'Acceso básico', status: true, permissions: [] });

// Units
const unitIds = ['Unidad', 'Metro', 'Litro'].map((n) => upsertByName('unidades_medida', { name: n }));

// Categories
const categorySofaId = upsertByName('categorias', { name: 'Sofás', description: 'Línea hogar' });
const categorySillaId = upsertByName('categorias', { name: 'Sillas', description: 'Línea hogar' });
const categoryMuebleId = upsertByName('categorias', { name: 'Muebles', description: 'Línea hogar' });
const categoryCamasId = upsertByName('categorias', { name: 'Camas', description: 'Línea hogar' });
const categoryMesaId = upsertByName('categorias', { name: 'Mesas', description: 'Línea hogar' });

// Materials
const materialTelaId = upsertByName('materiales', { name: 'Tela', category: categoryMuebleId });
const materialEspumaId = upsertByName('materiales', { name: 'Espuma', category: categoryMuebleId });
const materialCueroId = upsertByName('materiales', { name: 'Cuero', category: categoryMuebleId });
const materialMaderaId = upsertByName('materiales', { name: 'Madera', category: categoryMuebleId });
const materialMetalId = upsertByName('materiales', { name: 'Metal', category: categoryMuebleId });
const materialPlasticoId = upsertByName('materiales', { name: 'Plástico', category: categoryMuebleId });
const materialVidrioId = upsertByName('materiales', { name: 'Vidrio', category: categoryMuebleId });

// Services
const serviceTapizadoId = upsertByName('servicios', { name: 'Tapizado', description: 'Tapizado de muebles y hogar', imageUrl: '', status: true });
const serviceReparacionId = upsertByName('servicios', { name: 'Reparación', description: 'Reparación de muebles', imageUrl: '', status: true });
const serviceFrabricacionId = upsertByName('servicios', { name: 'Fabricación', description: 'Fabricación de muebles', imageUrl: '', status: true });
const serviceMantenimientoId = upsertByName('servicios', { name: 'Mantenimiento', description: 'Mantenimiento de muebles', imageUrl: '', status: true });

// Products
function upsertProduct(name, description, category) {
  const existing = db.productos.findOne({ name });
  if (existing) return existing._id;
  return db.productos.insertOne({ name, description, category }).insertedId;
}
const productSofaId = upsertProduct('Sofá 2 puestos', 'Sofá estándar', categorySofaId);
const productSillaId = upsertProduct('Silla comedor', 'Silla madera', categorySillaId);
const productMesaId = upsertProduct('Mesa de centro', 'Mesa de madera', categoryMesaId);
const productCamasId = upsertProduct('Cama queen', 'Cama de madera', categoryCamasId);

// Users
function upsertUser(email, name, role) {
  const existing = db.usuarios.findOne({ email });
  if (existing) return existing._id;
  return db.usuarios.insertOne({ name, email, password: 'hashed_password', role, status: true, registeredAt: new Date(), favorites: [] }).insertedId;
}
const userAdminId = upsertUser('admin@consoft.test', 'Admin', adminRoleId);
const userClientId = upsertUser('cliente@consoft.test', 'Cliente', userRoleId);

// Favorites (destacados)
db.usuarios.updateOne({ _id: userClientId }, { $addToSet: { favorites: { $each: [productSofaId, productSillaId] } } });

// Stock (materiales_stock) – uses Decimal128
function ensureStock(material, unit, quantity) {
  db.materiales_stock.updateOne(
    { material, unit },
    { $setOnInsert: { material, unit, quantity: NumberDecimal(quantity) } },
    { upsert: true }
  );
}
ensureStock(materialTelaId, unitIds[0], '25.00');
ensureStock(materialEspumaId, unitIds[0], '50.00');
ensureStock(materialCueroId, unitIds[0], '10.00');
ensureStock(materialMaderaId, unitIds[0], '10.00');
ensureStock(materialMetalId, unitIds[0], '10.00');
ensureStock(materialPlasticoId, unitIds[0], '10.00');
ensureStock(materialVidrioId, unitIds[0], '10.00');


// Visit + Order example
const visitId = (function () {
  const existing = db.visitas.findOne({ user: userClientId });
  if (existing) return existing._id;
  return db.visitas.insertOne({
    user: userClientId,
    scheduledAt: new Date(Date.now() + 86400000),
    address: 'Calle 123 #45-67, Medellín',
    status: 'programada',
    services: [
      { service: serviceTapizadoId,  quantity: 1, notes: 'Tapizado en cuero' },
      { service: serviceReparacionId,  quantity: 1, notes: '' },
      { service: serviceFrabricacionId,  quantity: 1, notes: '' },
      { service: serviceMantenimientoId,  quantity: 1, notes: '' },
    ],
  }).insertedId;
})();

// Ensure unique order per visit
if (!db.pedidos.findOne({ visit: visitId })) {
  db.pedidos.insertOne({
    visit: visitId,
    type: 'cotización',
    status: 'en_proceso',
    address: 'Calle 123 #45-67, Medellín',
    startedAt: new Date(),
    notes: 'Cliente solicita cotización inicial',
    payments: [
      { amount: 100000, paidAt: new Date(), method: 'QR', status: 'confirmado' },
    ],
    attachments: [
      { url: 'https://example.com/ref1.jpg', type: 'image/jpeg', uploadedBy: userClientId, uploadedAt: new Date() },
    ],
    usedMaterials: [
      { material: materialTelaId, quantity: NumberDecimal('2.50'), unitCost: NumberDecimal('40000.00'), unit: unitIds[0] },
    ],
  });
}

print('envio de datos de prueba.');

