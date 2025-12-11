import { Request, Response } from 'express';
import { OrderModel } from '../models/order.model';
import { createCrudController } from './crud.controller';
import { AuthRequest } from '../middlewares/auth.middleware';

const base = createCrudController(OrderModel);

export const OrderController = {
	...base,

	get: async (req: Request, res: Response) => {
		try {
			const order = await OrderModel.findById(req.params.id)
				.populate('user', '-password -__v ')
				.populate('payments')
				.populate('items.id_servicio');
			if (!order) return res.status(404).json({ message: 'Not found' });
			const total = order.items.reduce((sum, item) => sum + (item.valor || 0), 0);
			const paid = order.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
			const restante = total - paid;
			return res.json({ ...order.toObject(), total, paid, restante });
		} catch (error) {
			return res.status(500).json({ message: 'Error retrieving order' });
		}
	},
	list: async (req: Request, res: Response) => {
		try {
			const orders = await OrderModel.find()
				.populate('user', '-password -__v ')
				.populate('payments')
				.populate('items.id_servicio');

			const result = orders
				.map((order) => {
					const total = order.items.reduce((sum, item) => sum + (item.valor || 0), 0);
					const paid = order.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
					const restante = total - paid;

					return {
						...order.toObject(),
						total,
						paid,
						restante,
						paymentStatus: restante <= 0 ? 'Pagado' : 'Pendiente',
					};
				})
				.filter((order) => order.paymentStatus != 'Pagado');

			res.json(result);
		} catch (error) {
			res.status(500).json({ message: 'Error retrieving orders' });
		}
	},
	mine: async (req: AuthRequest, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId) return res.status(403).json({ message: 'Unauthorized' });

			const orders = await OrderModel.find({ user: userId })
				.populate({
					path: 'items.id_servicio',
					select: 'name', // solo traemos name
				})
				.sort({ startedAt: -1 })
				.lean(); // lean devuelve plain objects, evita problemas con métodos de Mongoose

			const calcDiasRestantes = (start?: Date | null) => {
				if (!start) return '–';
				const hoy = new Date();
				const inicio = new Date(start);
				const fin = new Date(inicio);
				fin.setDate(fin.getDate() + 15);
				const diff = Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
				return diff <= 0 ? '0 Días' : `${diff} Días`;
			};

			const transformed = orders.map((o) => {
				const item = o.items?.[0];
				const servicio = item?.id_servicio as { name?: string } | undefined;
				return {
					id: o._id,
					nombre: servicio?.name || 'Pedido',
					estado: o.payments?.some((p) => p.status === 'Pagado') ? 'Listo' : 'Pendiente',
					valor: `$${o.items
						?.reduce((sum, i) => sum + (i.valor || 0), 0)
						.toLocaleString()} COP`,
					dias: calcDiasRestantes(o.startedAt),
					raw: o,
				};
			});

			return res.status(200).json({ orders: transformed });
		} catch (error) {
			console.error('Error en /orders/mine:', error);
			return res.status(500).json({ message: 'Internal server error' });
		}
	},
};
