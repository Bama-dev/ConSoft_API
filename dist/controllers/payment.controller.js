"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const order_model_1 = require("../models/order.model");
const crud_controller_1 = require("./crud.controller");
const base = (0, crud_controller_1.createCrudController)(order_model_1.OrderModel);
exports.PaymentController = {
    ...base,
    list: async (req, res) => {
        try {
            const orders = await order_model_1.OrderModel.find();
            const payments = orders.map((order) => {
                // total de los items
                const total = order.items.reduce((sum, item) => sum + (item.valor || 0), 0);
                // pagado acumulado solo de pagos aprobados
                let acumulado = 0;
                const APPROVED = new Set(['aprobado', 'confirmado']);
                // transformar cada pago agregando su restante en ese momento
                const pagosConRestante = order.payments.map((p) => {
                    // solo sumamos si el pago está aprobado
                    const status = String(p.status || '').toLowerCase();
                    if (APPROVED.has(status)) {
                        acumulado += p.amount || 0;
                    }
                    return {
                        ...p.toObject(), // asegurarse que sea objeto plano
                        restante: total - acumulado, // pendiente hasta ese pago
                    };
                });
                return {
                    _id: order._id,
                    total,
                    paid: acumulado,
                    restante: total - acumulado,
                    payments: pagosConRestante,
                };
            });
            res.status(200).json({ ok: true, payments });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    get: async (req, res) => {
        try {
            const orderId = req.params.id;
            const order = await order_model_1.OrderModel.findById(orderId);
            if (!order)
                return res.status(404).json({ message: 'Order not found' });
            const total = order.items.reduce((sum, item) => sum + (item.valor || 0), 0);
            let acumulado = 0;
            const pagosConRestante = order.payments.map((p) => {
                acumulado += p.amount || 0;
                return {
                    ...p.toObject(),
                    restante: total - acumulado,
                };
            });
            return res.json({
                _id: order._id,
                total,
                paid: acumulado,
                restante: total - acumulado,
                payments: pagosConRestante,
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },
    create: async (req, res) => {
        try {
            const { orderId, amount, paidAt, method, status } = req.body;
            if (!orderId || amount == null || !paidAt || !method || !status) {
                return res
                    .status(400)
                    .json({ message: 'orderId, amount, paidAt, method, status are required' });
            }
            const order = await order_model_1.OrderModel.findById(orderId);
            if (!order)
                return res.status(404).json({ message: 'Order not found' });
            order.payments.push({ amount, paidAt, method, status });
            await order.save();
            const payment = order.payments[order.payments.length - 1];
            return res.status(201).json(payment);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },
    update: async (req, res) => {
        try {
            const orderId = req.params.id;
            const { paymentId, amount, paidAt, method, status } = req.body;
            if (!paymentId)
                return res.status(400).json({ message: 'paymentId is required' });
            const update = {};
            if (amount != null)
                update['payments.$.amount'] = amount;
            if (paidAt != null)
                update['payments.$.paidAt'] = paidAt;
            if (method != null)
                update['payments.$.method'] = method;
            if (status != null)
                update['payments.$.status'] = status;
            const updated = await order_model_1.OrderModel.findOneAndUpdate({ _id: orderId, 'payments._id': paymentId }, { $set: update }, { new: true });
            if (!updated)
                return res.status(404).json({ message: 'Order or payment not found' });
            const payment = updated.payments.id(paymentId);
            return res.json(payment);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },
    remove: async (req, res) => {
        try {
            const orderId = req.params.id;
            const { paymentId } = req.body;
            if (!paymentId)
                return res.status(400).json({ message: 'paymentId is required' });
            const updated = await order_model_1.OrderModel.findByIdAndUpdate(orderId, { $pull: { payments: { _id: paymentId } } }, { new: true });
            if (!updated)
                return res.status(404).json({ message: 'Order not found' });
            return res.status(204).send();
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },
};
