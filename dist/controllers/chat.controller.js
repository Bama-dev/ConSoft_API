"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const chatMessage_model_1 = require("../models/chatMessage.model");
const quotation_model_1 = require("../models/quotation.model");
exports.ChatController = {
    listMessages: async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId)
                return res.status(401).json({ message: 'Unauthorized' });
            const quotationId = req.params.quotationId;
            const quotation = await quotation_model_1.QuotationModel.findById(quotationId).select('user');
            if (!quotation)
                return res.status(404).json({ message: 'Quotation not found' });
            // Permitir al dueño; para admin, se puede proteger la ruta con verifyRole
            if (String(quotation.user) !== String(userId)) {
                // No es dueño; la ruta debería aplicar verifyRole aguas arriba si es admin
            }
            const messages = await chatMessage_model_1.ChatMessageModel.find({ quotation: quotationId })
                .sort({ sentAt: 1 })
                .populate('sender', 'name email');
            return res.json({ ok: true, messages });
        }
        catch (err) {
            return res.status(500).json({ error: 'Error getting messages' });
        }
    },
};
