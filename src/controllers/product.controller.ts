import { Request, Response } from 'express';
import { ProductModel } from '../models/product.model';
import { createCrudController } from './crud.controller';

const base = createCrudController(ProductModel);

export const ProductController = {
	...base,
	list: async (req: Request, res: Response) => {
		try {
			const products = await ProductModel.find().populate('category');
			if (!products) {
				return res.status(404).json({ ok: false, message: 'No products found' });
			}

			res.status(200).json({ ok: true, products });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},
};
