import { Request, Response } from 'express';
import { OrderModel } from '../models/order.model';
import { createCrudController } from './crud.controller';

const base = createCrudController(OrderModel);

export const SaleController = {
	// Mantener solo lectura: las ventas se derivan de pedidos pagados
	list: async (_req: Request, res: Response) => {
		const orders = await OrderModel.find().populate("user", "name")

		const sales = orders
			.map((order) => {
				const total = order.items.reduce((sum, item) => sum + (item.valor || 0), 0);
				const paid = order.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
				const restante = total - paid;

				return {
					_id: order._id,
					total,
					paid,
					restante,
					user: order.user, // si tienes referencia al cliente
				};
			})
			.filter((order) => order.restante <= 0);

		return res.status(200).json({ ok: true, sales });
	},

	get: async (req: Request, res: Response) => {
		const order = await OrderModel.findById(req.params.id).populate("user", "name");
		if (!order) return res.status(404).json({ message: 'Not found' });
		const total = order.items.reduce((sum, item) => sum + (item.valor || 0), 0);
		const paid = order.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
		const restante = total - paid;
		if (restante > 0) return res.status(404).json({ message: 'Not a completed sale' });
		return res.json({ _id: order._id, total, paid, restante, user: order.user });
	},

	create: async (_req: Request, res: Response) => res.status(405).json({ message: 'Sales are derived; cannot create directly' }),
	update: async (_req: Request, res: Response) => res.status(405).json({ message: 'Sales are derived; cannot update directly' }),
	remove: async (_req: Request, res: Response) => res.status(405).json({ message: 'Sales are derived; cannot delete directly' }),
};
