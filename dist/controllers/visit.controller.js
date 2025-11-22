"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitController = void 0;
const visit_model_1 = require("../models/visit.model");
const crud_controller_1 = require("./crud.controller");
const base = (0, crud_controller_1.createCrudController)(visit_model_1.VisitModel);
exports.VisitController = {
    ...base,
    list: async (req, res) => {
        const visits = await visit_model_1.VisitModel.find()
            .populate('user', 'name email') // ✔ user es un ObjectId
            .populate('services', 'name description'); // ✔ services es un array de ObjectId
        return res.json({ ok: true, visits });
    },
    get: async (req, res) => {
        const visit = await visit_model_1.VisitModel.findById(req.params.id).populate('user', 'name email');
        if (!visit)
            return res.status(404).json({ message: 'Not found' });
        return res.json(visit);
    },
};
