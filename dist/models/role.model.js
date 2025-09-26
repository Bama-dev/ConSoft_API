"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleModel = void 0;
const mongoose_1 = require("mongoose");
const RoleSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true },
    status: { type: Boolean, default: true },
    permissions: [{ type: mongoose_1.Types.ObjectId, ref: 'Permiso' }],
}, { timestamps: true });
RoleSchema.virtual('usersCount', {
    ref: 'User',
    localField: '_id',
    foreignField: 'role',
    count: true,
});
RoleSchema.set('toJSON', { virtuals: true });
exports.RoleModel = (0, mongoose_1.model)('Role', RoleSchema);
