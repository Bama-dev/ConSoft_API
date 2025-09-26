import { Schema, model, Types, InferSchemaType } from 'mongoose';

const ProductSchema = new Schema(
	{
		name: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
		category: { type: Types.ObjectId, ref: 'Categoria', required: true },
		status: { type: Boolean },
		imageUrl: { type: String },
	},
);

export const ProductModel = model('Producto', ProductSchema);
