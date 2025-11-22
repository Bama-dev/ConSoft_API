"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleController = void 0;
const order_model_1 = require("../models/order.model");
const crud_controller_1 = require("./crud.controller");
const base = (0, crud_controller_1.createCrudController)(order_model_1.OrderModel);
exports.SaleController = {
    ...base,
    list: async (req, res) => {
        const orders = await order_model_1.OrderModel.find().populate("user", "name");
        const sales = orders
            .map((order) => {
            const total = order.items.reduce((sum, item) => sum + (item.valor || 0), 0);
            const paid = order.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
            const restante = total - paid;
            return {
                order,
                total,
                paid,
                restante,
                user: order.user, // si tienes referencia al cliente
            };
        })
            .filter((order) => order.restante <= 0);
        return res.status(200).json({ ok: true, sales });
    },
};
