import { Schema, model, Types, InferSchemaType } from 'mongoose';

const VisitServiceSchema = new Schema(
	{
		service: { type: Types.ObjectId, ref: 'Service', required: true },
		value: { type: Number },
		quantity: { type: Number, min: 0 },
		notes: { type: String, trim: true },
	},
	{ _id: false }
);

const VisitSchema = new Schema(
	{
		user: { type: Types.ObjectId, ref: 'User', required: true },
		visitDate: { type: Date, required: true },
		address: { type: String, required: true, trim: true },
		status: { type: String, required: true, trim: true },
		services: { type: [VisitServiceSchema], default: [] },
	},
	{ collection: 'visitas' }
);

export const VisitModel = model('Visit', VisitSchema);
