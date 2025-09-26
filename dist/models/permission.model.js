"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionModel = void 0;
const mongoose_1 = require("mongoose");
const PermissionSchema = new mongoose_1.Schema({
    module: { type: String, required: true, trim: true },
    action: { type: String, trim: true },
});
exports.PermissionModel = (0, mongoose_1.model)('Permiso', PermissionSchema);
