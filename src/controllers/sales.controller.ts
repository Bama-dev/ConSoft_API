import { Request, Response } from 'express';
import { OrderModel } from '../models/order.model';
import { createCrudController } from './crud.controller';

const base = createCrudController(OrderModel);

export const SaleController = {
	...base,
	list: async (req: Request, res: Response) => {
		const orders = await OrderModel.find().populate("user", "name")

		const sales = orders
			.map((order) => {
				const total = order.items.reduce((sum, item) => sum + (item.valor || 0), 0);
				const paid = order.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
				const restante = total - paid;

				return {
					order,
					total,
					paid,
					restante,
					user: order.user, // si tienes referencia al cliente
				};
			})
			.filter((order) => order.restante <= 0);

		return res.status(200).json({ ok: true, sales });
	},
};
