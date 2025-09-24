import { RoleModel } from '../models/role.model';
import { env } from './env';

/**
 * Ensure core data exists in the database (roles, etc.) and populate
 * runtime env defaults (defaultUserRoleId/adminRoleId) if missing.
 */
export async function ensureCoreData(): Promise<void> {
  const ADMIN_NAME = 'Administrador';
  const USER_NAME = 'Usuario';

  // Ensure Admin role
  let adminRole = await RoleModel.findOne({ name: ADMIN_NAME });
  if (!adminRole) {
    adminRole = await RoleModel.create({ name: ADMIN_NAME, description: 'Administrador del sistema' });
  }

  // Ensure User role
  let userRole = await RoleModel.findOne({ name: USER_NAME });
  if (!userRole) {
    userRole = await RoleModel.create({ name: USER_NAME, description: 'Usuario estándar' });
  }

  // Populate runtime defaults if not provided via env
  if (!env.adminRoleId) {
    (env as any).adminRoleId = String(adminRole._id);
  }
  if (!env.defaultUserRoleId) {
    (env as any).defaultUserRoleId = String(userRole._id);
  }
}


