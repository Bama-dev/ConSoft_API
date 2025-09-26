"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCrudController = createCrudController;
function createCrudController(model) {
    return {
        list: async (_req, res) => {
            const items = await model.find();
            res.json(items);
        },
        get: async (req, res) => {
            const item = await model.findById(req.params.id);
            if (!item)
                return res.status(404).json({ message: 'Not found' });
            res.json(item);
        },
        create: async (req, res) => {
            const item = await model.create(req.body);
            res.status(201).json(item);
        },
        update: async (req, res) => {
            const item = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!item)
                return res.status(404).json({ message: 'Not found' });
            res.json(item);
        },
        remove: async (req, res) => {
            const item = await model.findByIdAndDelete(req.params.id);
            if (!item)
                return res.status(404).json({ message: 'Not found' });
            res.status(204).send();
        },
    };
}
