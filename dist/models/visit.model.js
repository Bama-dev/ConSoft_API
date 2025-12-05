"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitModel = void 0;
const mongoose_1 = require("mongoose");
const VisitSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true },
    visitDate: { type: Date, required: true },
    address: { type: String, required: true, trim: true },
    status: { type: String, required: true, trim: true },
    services: {
        type: [
            {
                type: mongoose_1.Types.ObjectId,
                required: true,
                ref: 'Servicio',
            },
        ],
        default: [],
    },
}, { collection: 'visitas' });
exports.VisitModel = (0, mongoose_1.model)('Visit', VisitSchema);
