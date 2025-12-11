import { Request, Response } from 'express';
import { VisitModel } from '../models/visit.model';
import { createCrudController } from './crud.controller';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Types } from 'mongoose';

const base = createCrudController(VisitModel);

export const VisitController = {
	...base,

	list: async (req: Request, res: Response) => {
		const visits = await VisitModel.find()
			.populate('user', 'name email') // ✔ user es un ObjectId
			.populate('services', 'name description'); // ✔ services es un array de ObjectId
		return res.json({ ok: true, visits });
	},

	get: async (req: Request, res: Response) => {
		const visit = await VisitModel.findById(req.params.id).populate('user', 'name email');
		if (!visit) return res.status(404).json({ message: 'Not found' });
		return res.json(visit);
	},

	// Crear visita para el usuario autenticado
	createForMe: async (req: AuthRequest, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'Unauthorized' });
			const { visitDate, address, status, services } = req.body ?? {};
			if (!visitDate) return res.status(400).json({ message: 'visitDate is required' });
			if (!address || typeof address !== 'string' || !address.trim()) {
				return res.status(400).json({ message: 'address is required' });
			}
			const payload: any = {
				user: new Types.ObjectId(String(userId)),
				visitDate: new Date(visitDate),
				address: address.trim(),
				status: status && typeof status === 'string' ? status : 'pendiente',
				services: Array.isArray(services) ? services.filter(Boolean) : [],
			};
			const created = await VisitModel.create(payload);
			const populated = await created.populate('user', 'name email').then(d => d.populate('services', 'name description'));
			return res.status(201).json({ ok: true, visit: populated });
		} catch (e) {
			return res.status(500).json({ error: 'Error creating visit' });
		}
	},

	// Listar solo las visitas del usuario autenticado
	listMine: async (req: AuthRequest, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'Unauthorized' });
			const visits = await VisitModel.find({ user: userId })
				.sort({ visitDate: -1 })
				.populate('user', 'name email')
				.populate('services', 'name description');
			return res.json({ ok: true, visits });
		} catch (e) {
			return res.status(500).json({ error: 'Error fetching visits' });
		}
	},
};
