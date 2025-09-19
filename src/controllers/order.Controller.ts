import { Request, Response } from 'express';
import { OrderModel } from '../models/order.model';
import { createCrudController } from './crud.controller';

const base = createCrudController(OrderModel);

export const OrderController = {
	...base,
	list: async (req: Request, res: Response) => {
		try {
			const orders = await OrderModel.find().populate('user').select("-password -__v");
			res.json(orders);
		} catch (error) {
			res.status(500).json({ message: 'Error retrieving orders' });
		}
	}

};
