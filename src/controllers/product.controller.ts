import { ProductModel } from '../models/product.model';
import { createCrudController } from './crud.controller';

const base = createCrudController(ProductModel);

export const ProductController = {
	...base,
};
