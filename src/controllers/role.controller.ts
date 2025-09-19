import { Request, Response } from 'express';
import { RoleModel } from '../models/role.model';
import { createCrudController } from './crud.controller';

const base = createCrudController(RoleModel);

export const RoleController = {
	...base,

	create: async (req: Request, res: Response) => {
		try {
			const { name, description, permissions } = req.body;

			const exists = await RoleModel.findOne({ name });
			if (exists) {
				return res.status(400).json({ error: 'Role already exists' });
			}

			// Crear nuevo rol
			const newRole = await RoleModel.create({ name, description, permissions });

			return res.status(201).json(newRole);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ error: 'Internal server error' });
		}
	},

};
