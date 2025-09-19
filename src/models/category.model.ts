import { Schema, model, Types, InferSchemaType } from 'mongoose';

const CategorySchema = new Schema(
	{
		name: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
	},
	{ timestamps: true, collection: 'categorias' }
);

//Virtual populate
CategorySchema.virtual('products', {
	ref: 'products',
	localField: '_id',
	foreignField: 'category',
});

CategorySchema.set('toJSON', { virtuals: true });

export const CategoryModel = model('Category', CategorySchema);
