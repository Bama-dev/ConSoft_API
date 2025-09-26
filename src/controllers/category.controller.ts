import { Request, Response } from 'express';
import { CategoryModel } from '../models/category.model';
import { createCrudController } from './crud.controller';

const base = createCrudController(CategoryModel);

export const CategoryControlleer = {
	...base,

	list: async (req: Request, res: Response) => {
		try {
			const categories = await CategoryModel.find().populate('products');
			if (!categories) {
				return res.status(404).json({ ok: false, message: 'No categories found' });
			}

			res.status(200).json({ ok: true, categories });
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Internal server error' });
		}
	},
};
