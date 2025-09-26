"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryControlleer = void 0;
const category_model_1 = require("../models/category.model");
const crud_controller_1 = require("./crud.controller");
const base = (0, crud_controller_1.createCrudController)(category_model_1.CategoryModel);
exports.CategoryControlleer = {
    ...base,
};
