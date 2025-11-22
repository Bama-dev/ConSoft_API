import { Schema, model, Types } from 'mongoose';

const ChatMessageSchema = new Schema(
	{
		quotation: { type: Types.ObjectId, ref: 'Cotizacion', required: true, index: true },
		sender: { type: Types.ObjectId, ref: 'User', required: true, index: true },
		message: { type: String, required: true, trim: true },
		sentAt: { type: Date, default: () => new Date() },
	},
	{ timestamps: false, collection: 'cotizacion_mensajes' }
);

export const ChatMessageModel = model('ChatMessage', ChatMessageSchema);


