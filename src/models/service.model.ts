import { Schema, model, Types, InferSchemaType } from 'mongoose';

const ServiceSchema = new Schema(
	{
		name: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
		imageUrl: { type: String, trim: true },
		active: { type: Boolean, default: true },
	},
	{ timestamps: true, collection: 'servicios' }
);

export const ServiceModel = model('Service', ServiceSchema);
