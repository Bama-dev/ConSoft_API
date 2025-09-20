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
					ref: 'servicios',
				},
			],
			default: [],
		},
	},
	{ collection: 'visitas' }
);

export const VisitModel = model('Visit', VisitSchema);
