"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_model_1 = require("../models/product.model");
const crud_controller_1 = require("./crud.controller");
const base = (0, crud_controller_1.createCrudController)(product_model_1.ProductModel);
exports.ProductController = {
    ...base,
};
