import { Schema, model, Types, InferSchemaType } from 'mongoose';

const ServiceSchema = new Schema(
	{
		name: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
		imageUrl: { type: String, trim: true },
		status: { type: Boolean, default: true },
	},
);

export const ServiceModel = model('Servicio', ServiceSchema);
