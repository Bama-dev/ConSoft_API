import { Schema, model, Types } from 'mongoose';

const QuotationItemSchema = new Schema(
	{
		product: { type: Types.ObjectId, ref: 'Producto', required: true },
		quantity: { type: Number, required: true, min: 1, default: 1 },
		color: { type: String, trim: true },
		size: { type: String, trim: true },
		price: { type: Number, required: false }, // precio unitario
		adminNotes: { type: String, trim: true, default: '' },
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
		totalEstimate: { type: Number }, // suma de todos los items.total
		adminNotes: { type: String, trim: true },
	},
	{ timestamps: true, collection: 'cotizaciones' }
);

// Garantiza UN solo carrito activo por usuario
QuotationSchema.index(
	{ user: 1, status: 1 },
	{ unique: true, partialFilterExpression: { status: 'carrito' } }
);

// Índices para listados
QuotationSchema.index({ user: 1, createdAt: -1 });
QuotationSchema.index({ status: 1, createdAt: -1 });

export const QuotationModel = model('Cotizacion', QuotationSchema);
