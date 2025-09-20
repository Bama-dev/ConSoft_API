import { Request, Response } from 'express';
import { OrderModel } from '../models/order.model';
import { createCrudController } from './crud.controller';

const base = createCrudController(OrderModel);

export const OrderController = {
	...base,
	list: async (req: Request, res: Response) => {
		try {
			const orders = await OrderModel.find()
				.populate('user', '-password -__v ')
				.populate('payments');

			const result = orders.map((order) => {
				const total = order.items.reduce((sum, item) => sum + (item.valor || 0), 0);
				const paid = order.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
				const restante = total - paid;

				return {
					...order.toObject(),
					total,
					paid,
					restante,
					paymentStatus: restante < 0 ? 'Pagado' : 'Pendiente',
				};
			});

			res.json(orders);
		} catch (error) {
			res.status(500).json({ message: 'Error retrieving orders' });
		}
	},
};
