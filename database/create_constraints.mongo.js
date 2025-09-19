// mongosh script – create indexes/constraints
// Usage: mongosh --file database/create_constraints.mongo.js

const dbName = 'consoft';
db = db.getSiblingDB(dbName);

db.usuarios.createIndex({ email: 1 }, { unique: true, name: 'uniq_email' });
db.materiales_stock.createIndex({ material: 1, unit: 1 }, { unique: true, name: 'uniq_material_unit' });
db.pedidos.createIndex({ visit: 1 }, { unique: true, sparse: true, name: 'uniq_visit' });

// Helpful indexes (optional)
db.roles.createIndex({ name: 1 }, { name: 'role_name_idx' });
db.categorias.createIndex({ name: 1 }, { name: 'category_name_idx' });
db.productos.createIndex({ category: 1 }, { name: 'product_category_idx' });
db.visitas.createIndex({ user: 1, scheduledAt: -1 }, { name: 'visit_user_date_idx' });

print('Indexes created.');

