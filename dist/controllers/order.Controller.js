"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const order_model_1 = require("../models/order.model");
const crud_controller_1 = require("./crud.controller");
const base = (0, crud_controller_1.createCrudController)(order_model_1.OrderModel);
exports.OrderController = {
    ...base,
    list: async (req, res) => {
        try {
            const orders = await order_model_1.OrderModel.find()
                .populate('user', '-password -__v ')
                .populate('payments');
            const result = orders.map((order) => {
                const total = order.items.reduce((sum, item) => sum + (item.valor || 0), 0);
                const paid = order.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
                const restante = total - paid;
                return {
                    ...order.toObject(),
                    total,
                    paid,
                    restante,
                    paymentStatus: restante <= 0 ? 'Pagado' : 'Pendiente',
                };
            }).filter((order) => order.paymentStatus != "Pagado");
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ message: 'Error retrieving orders' });
        }
    },
};
