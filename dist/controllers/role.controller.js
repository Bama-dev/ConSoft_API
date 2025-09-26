"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleController = void 0;
const role_model_1 = require("../models/role.model");
const crud_controller_1 = require("./crud.controller");
const base = (0, crud_controller_1.createCrudController)(role_model_1.RoleModel);
exports.RoleController = {
    ...base,
    list: async (req, res) => {
        try {
            const roles = await role_model_1.RoleModel.find().populate('usersCount').populate("permissions");
            return res.status(200).json({ ok: true, roles });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    create: async (req, res) => {
        try {
            const { name, description, permissions } = req.body;
            const exists = await role_model_1.RoleModel.findOne({ name });
            if (exists) {
                return res.status(400).json({ error: 'Role already exists' });
            }
            // Crear nuevo rol
            const newRole = await role_model_1.RoleModel.create({ name, description, permissions });
            return res.status(201).json(newRole);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
};
