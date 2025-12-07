import { Schema, model, Types, InferSchemaType } from 'mongoose';

const VisitSchema = new Schema(
	{
		user: { type: Types.ObjectId, ref: 'User', required: true },
		visitDate: { type: Date, required: true },
		address: { type: String, required: true, trim: true },
		status: { type: String, required: true, trim: true },
		services: {
			type: [
				{
					type: Types.ObjectId,
					required: true,
					ref: 'Servicio',
				},
			],
			default: [],
		},
	},
	{ collection: 'visitas' }
);

// Índices para consultas comunes
VisitSchema.index({ user: 1, visitDate: -1 });
VisitSchema.index({ status: 1, visitDate: -1 });
VisitSchema.index({ services: 1 });

export const VisitModel = model('Visit', VisitSchema);
