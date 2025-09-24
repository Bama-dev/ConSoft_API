"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceController = void 0;
const service_model_1 = require("../models/service.model");
const crud_controller_1 = require("./crud.controller");
const base = (0, crud_controller_1.createCrudController)(service_model_1.ServiceModel);
exports.ServiceController = {
    ...base,
};
