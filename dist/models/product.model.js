"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModel = void 0;
const mongoose_1 = require("mongoose");
const ProductSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: mongoose_1.Types.ObjectId, ref: 'Category', required: true },
    status: { type: Boolean },
    imageUrl: { type: String },
});
exports.ProductModel = (0, mongoose_1.model)('Producto', ProductSchema);
