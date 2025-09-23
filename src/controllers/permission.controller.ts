import { Request, Response } from 'express';
import { PermissionModel } from '../models/permission.model';
import { createCrudController } from './crud.controller';

const base = createCrudController(PermissionModel);

export const PermissionController = {
	...base,

  	create: async (req: Request, res: Response) => {
  		try {
  			const { module, action } = req.body;

  			if (!module) {
  				return res.status(400).json({ message: 'module is required' });
  			}

  			const exists = await PermissionModel.findOne({ module, action });
  			if (exists) {
  				return res.status(409).json({ message: 'Permission already exists for this module/action' });
  			}

  			const created = await PermissionModel.create({ module, action });
  			return res.status(201).json(created);
  		} catch (err: any) {
  			if (err?.code === 11000) {
  				return res.status(409).json({ message: 'Duplicate permission' });
  			}
  			return res.status(500).json({ message: 'Internal server error' });
  		}
  	},

  	update: async (req: Request, res: Response) => {
  		try {
  			const updated = await PermissionModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  			if (!updated) return res.status(404).json({ message: 'Not found' });
  			return res.json(updated);
  		} catch (err: any) {
  			if (err?.code === 11000) {
  				return res.status(409).json({ message: 'Duplicate permission' });
  			}
  			return res.status(500).json({ message: 'Internal server error' });
  		}
  	},
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
