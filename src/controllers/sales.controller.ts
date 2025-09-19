import { OrderModel } from '../models/order.model';
import { createCrudController } from './crud.controller';

const base = createCrudController(OrderModel);

export const SaleController = {
    ...base,
};
