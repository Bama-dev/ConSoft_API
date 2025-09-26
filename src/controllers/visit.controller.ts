import { VisitModel } from '../models/visit.model';
import { createCrudController } from './crud.controller';

const base = createCrudController(VisitModel);

export const VisitController = {
	...base,

	list: async (_req: Request, res: Response) => {
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
};
