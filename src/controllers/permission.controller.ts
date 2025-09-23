import { Request, Response } from 'express';
import { PermissionModel } from '../models/permission.model';
import { createCrudController } from './crud.controller';

const base = createCrudController(PermissionModel);

export const PermissionController = {
	...base,
	list: async (req: Request, res: Response) => {
		try {
			const permisos = await PermissionModel.aggregate([
				{
					$group: {
						_id: '$module',
						permissions: {
							$push: { _id: '$_id', module: '$module', action: '$action' },
						},
					},
				},
				{
					$project: {
						_id: 0,
						module: '$_id',
						permissions: 1,
					},
				},
			]);

			res.status(200).json({ ok: true, permisos });
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: 'Error al obtener permisos' });
		}
	},
};
