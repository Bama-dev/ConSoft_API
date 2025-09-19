import { Request } from 'express';
import { UserModel } from '../models/user.model';
import { createCrudController } from './crud.controller';
import { Response } from 'express';

const base = createCrudController(UserModel);

export const UserController = {
	...base,
	list: async (req: Request, res: Response) => {
		try {
			const users = await UserModel.find().select('-password -__v').populate({
				path: 'role',
				select: 'name description',
			});

			res.status(200).json({ ok: true, users });
		} catch (err) {
			res.status(500).json({ error: 'Error during fetching users' });
		}
	},
};
