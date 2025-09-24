"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryModel = void 0;
const mongoose_1 = require("mongoose");
const CategorySchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
});
//Virtual populate
CategorySchema.virtual('products', {
    ref: 'products',
    localField: '_id',
    foreignField: 'category',
});
CategorySchema.set('toJSON', { virtuals: true });
exports.CategoryModel = (0, mongoose_1.model)('Categoria', CategorySchema);
