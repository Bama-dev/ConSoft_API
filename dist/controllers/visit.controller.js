"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitController = void 0;
const visit_model_1 = require("../models/visit.model");
const crud_controller_1 = require("./crud.controller");
const base = (0, crud_controller_1.createCrudController)(visit_model_1.VisitModel);
exports.VisitController = {
    ...base,
};
