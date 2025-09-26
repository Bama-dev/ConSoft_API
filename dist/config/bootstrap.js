"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureCoreData = ensureCoreData;
const role_model_1 = require("../models/role.model");
const env_1 = require("./env");
/**
 * Ensure core data exists in the database (roles, etc.) and populate
 * runtime env defaults (defaultUserRoleId/adminRoleId) if missing.
 */
async function ensureCoreData() {
    const ADMIN_NAME = 'Administrador';
    const USER_NAME = 'Usuario';
    // Ensure Admin role
    let adminRole = await role_model_1.RoleModel.findOne({ name: ADMIN_NAME });
    if (!adminRole) {
        adminRole = await role_model_1.RoleModel.create({ name: ADMIN_NAME, description: 'Administrador del sistema' });
    }
    // Ensure User role
    let userRole = await role_model_1.RoleModel.findOne({ name: USER_NAME });
    if (!userRole) {
        userRole = await role_model_1.RoleModel.create({ name: USER_NAME, description: 'Usuario estándar' });
    }
    // Populate runtime defaults if not provided via env
    if (!env_1.env.adminRoleId) {
        env_1.env.adminRoleId = String(adminRole._id);
    }
    if (!env_1.env.defaultUserRoleId) {
        env_1.env.defaultUserRoleId = String(userRole._id);
    }
}
