import { NextFunction, Request, Response } from 'express';
import { IUser } from '../types/interfaces';

interface authenticatedRequest extends Request {
	user?: IUser & { role: any };
}

export const verifyRole = (module: string, action: string) => {
	return (req: authenticatedRequest, res: Response, next: NextFunction) => {
		try {
			const user = req.user;

			if (!user) {
				return res.status(401).json({ message: 'User not authenticated' });
			}

			const role = user.role;
			if (!role || !role.permissions) {
				return res.status(403).json({ message: 'User has no assigned permissions' });
			}

			const hasPermission = role.permissions.some(
				(perm: any) => perm.module === module && perm.action === action
			);

			if (!hasPermission) {
				return res
					.status(403)
					.json({ message: 'You do not have permission to perform this action' });
			}

			next();
		} catch (error) {
			console.error('verifyRole error: ', error);
			return res.status(403).json({ message: 'Invalid or expired token' });
		}
	};
};
