"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessageModel = void 0;
const mongoose_1 = require("mongoose");
const ChatMessageSchema = new mongoose_1.Schema({
    quotation: { type: mongoose_1.Types.ObjectId, ref: 'Cotizacion', required: true, index: true },
    sender: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true, trim: true },
    sentAt: { type: Date, default: () => new Date() },
}, { timestamps: false, collection: 'cotizacion_mensajes' });
exports.ChatMessageModel = (0, mongoose_1.model)('ChatMessage', ChatMessageSchema);
