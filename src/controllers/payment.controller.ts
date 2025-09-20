import { Request, Response } from 'express';
import { OrderModel } from '../models/order.model';
import { createCrudController } from './crud.controller';

const base = createCrudController(OrderModel);

export const PaymentController = {
	...base,
	list: async (req: Request, res: Response) => {
		try {
			const orders = await OrderModel.find();

			const payments = orders.map((order) => {
				// total de los items
				const total = order.items.reduce((sum, item) => sum + (item.valor || 0), 0);

				// total pagado hasta ahora
				const paid = order.payments.reduce((sum, p) => sum + (p.amount || 0), 0);

				// valor restante
				const restante = total - paid;

				return {
					_id: order._id,
					total,
					paid,
					restante,
					payments: order.payments,
				};
			});

			res.status(200).json({ ok: true, payments });
		} catch (error) {
			res.status(500).json({ message: 'Internal server error' });
		}
	},
};
