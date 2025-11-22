import { Schema, model, Types } from 'mongoose';

const QuotationItemSchema = new Schema(
	{
		product: { type: Types.ObjectId, ref: 'Producto', required: true },
		quantity: { type: Number, required: true, min: 1, default: 1 },
		color: { type: String, trim: true },
		size: { type: String, trim: true },
		notes: { type: String, trim: true },
	},
	{ _id: true }
);

const QuotationSchema = new Schema(
	{
		user: { type: Types.ObjectId, ref: 'User', required: true },
		status: {
			type: String,
			enum: ['carrito', 'solicitada', 'en_proceso', 'cotizada', 'cerrada'],
			default: 'carrito',
		},
		items: { type: [QuotationItemSchema], default: [] },
		totalEstimate: { type: Number },
	},
	{ timestamps: true, collection: 'cotizaciones' }
);

export const QuotationModel = model('Cotizacion', QuotationSchema);


