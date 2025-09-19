import { Schema, model, Types, InferSchemaType } from 'mongoose';

const ProductSchema = new Schema(
	{
		name: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
		category: { type: Types.ObjectId, ref: 'Category', required: true },
		imageUrl : {type: String}
	},
	{  collection: 'productos' }
);

export const ProductModel = model('Product', ProductSchema);
