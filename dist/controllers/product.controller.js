"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_model_1 = require("../models/product.model");
const crud_controller_1 = require("./crud.controller");
const base = (0, crud_controller_1.createCrudController)(product_model_1.ProductModel);
exports.ProductController = {
    ...base,
    list: async (req, res) => {
        try {
            const products = await product_model_1.ProductModel.find().populate('category');
            if (!products) {
                return res.status(404).json({ ok: false, message: 'No products found' });
            }
            res.status(200).json({ ok: true, products });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
};
