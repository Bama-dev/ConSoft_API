import { Schema, model, Types, InferSchemaType } from 'mongoose';

const CategorySchema = new Schema(
	{
		name: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
	},
);

//Virtual populate
CategorySchema.virtual('products', {
	ref: 'Producto',
	localField: '_id',
	foreignField: 'category',
});

CategorySchema.set('toJSON', { virtuals: true });

// Índice por nombre para búsquedas
CategorySchema.index({ name: 1 });

export const CategoryModel = model('Categoria', CategorySchema);
