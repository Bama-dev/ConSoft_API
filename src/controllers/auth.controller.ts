import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { compare, hash } from 'bcrypt';
import { generateToken } from '../utils/jwt';
import { env } from '../config/env';
import { AuthRequest } from '../middlewares/auth.middleware';

export const AuthController = {
	login: async (req: Request, res: Response) => {
		try {
			const { email, password } = req.body;
			const user = await UserModel.findOne({ email });

			if (!user) {
				return res.status(404).json({ message: 'User not found' });
			}

			const isMatch = await compare(password, user.password);

			if (!isMatch) {
				return res.status(400).json({ message: 'Incorrect password, please try again' });
			}

			const payload = {
				id: user._id,
				email: user.email,
				role: user.role,
			};

			const token = generateToken(payload);

			res.cookie('token', token, {
				httpOnly: true,
				secure: false,
				sameSite: 'none',
				maxAge: 1000 * 60 * 60 * 2,
			});

			res.status(200).json({ message: 'Login successful' });
		} catch (err) {
			res.status(500).json({ error: 'Error during login' });
		}
	},

	logout: async (req: Request, res: Response) => {
		try {
			res.clearCookie('token', {
				httpOnly: true,
				secure: env.nodeEnv === 'production',
				sameSite: 'strict',
			});
			res.json({ message: 'Logout successful' });
		} catch (err) {
			res.status(500).json({ error: 'Error during logout' });
		}
	},

	me: (req: AuthRequest, res: Response) => {
		if (!req.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		res.status(200).json({
			id: req.user.id,
			email: req.user.email,
			role: req.user.role.name,
		});
	},
};
