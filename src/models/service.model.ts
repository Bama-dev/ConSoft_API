import { Schema, model, Types, InferSchemaType } from 'mongoose';

const ServiceSchema = new Schema(
	{
		name: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
		imageUrl: { type: String, trim: true },
		status: { type: Boolean, default: true },
	},
);

// Índices sugeridos para búsquedas
ServiceSchema.index({ name: 1 });
ServiceSchema.index({ status: 1 });

export const ServiceModel = model('Servicio', ServiceSchema);
