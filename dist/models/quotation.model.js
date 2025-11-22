"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationModel = void 0;
const mongoose_1 = require("mongoose");
const QuotationItemSchema = new mongoose_1.Schema({
    product: { type: mongoose_1.Types.ObjectId, ref: 'Producto', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    color: { type: String, trim: true },
    size: { type: String, trim: true },
    notes: { type: String, trim: true },
}, { _id: true });
const QuotationSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['carrito', 'solicitada', 'en_proceso', 'cotizada', 'cerrada'],
        default: 'carrito',
    },
    items: { type: [QuotationItemSchema], default: [] },
    totalEstimate: { type: Number },
    adminNotes: { type: String, trim: true },
}, { timestamps: true, collection: 'cotizaciones' });
exports.QuotationModel = (0, mongoose_1.model)('Cotizacion', QuotationSchema);
