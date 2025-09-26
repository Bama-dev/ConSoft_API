"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionController = void 0;
const permission_model_1 = require("../models/permission.model");
const crud_controller_1 = require("./crud.controller");
const base = (0, crud_controller_1.createCrudController)(permission_model_1.PermissionModel);
exports.PermissionController = {
    ...base,
    list: async (req, res) => {
        try {
            const permisos = await permission_model_1.PermissionModel.aggregate([
                {
                    $group: {
                        _id: '$module',
                        permissions: {
                            $push: { _id: '$_id', module: '$module', action: '$action' },
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        module: '$_id',
                        permissions: 1,
                    },
                },
            ]);
            res.status(200).json({ ok: true, permisos });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener permisos' });
        }
    },
};
