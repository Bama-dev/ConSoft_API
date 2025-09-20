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

				// pagado acumulado
				let acumulado = 0;

				// transformar cada pago agregando su restante en ese momento
				const pagosConRestante = order.payments.map((p) => {
					acumulado += p.amount || 0;
					return {
						...p.toObject(), // asegúrate de que sea un objeto plano
						restante: total - acumulado,
					};
				});

				return {
					_id: order._id,
					total,
					paid: acumulado,
					restante: total - acumulado,
					payments: pagosConRestante,
				};
			});

			res.status(200).json({ ok: true, payments });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: 'Internal server error' });
		}
	},
};
