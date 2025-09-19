import { CategoryModel } from '../models/category.model';
import { createCrudController } from './crud.controller';

const base = createCrudController(CategoryModel);

export const CategoryControlleer = {
	...base,
};
