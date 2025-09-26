import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { compare, hash } from 'bcrypt';
import { generateToken } from '../utils/jwt';
import { env } from '../config/env';
import { AuthRequest } from '../middlewares/auth.middleware';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

export const AuthController = {
	login: async (req: Request, res: Response) => {
		try {
			const { email, password } = req.body;
			const user = await UserModel.findOne({ email }).populate('role', 'name');

			if (!user) {
				return res.status(404).json({ message: 'User not found' });
			}

			const isMatch = await compare(password, user.password);

			if (!isMatch) {
				return res.status(400).json({ message: 'Incorrect password, please try again' });
			}

			const payload: any = {
				id: user._id,
				email: user.email,
			};
			if (user.role) {
				payload.role = { id: (user.role as any)._id, name: (user.role as any).name };
			}

			const token = generateToken(payload);

			res.cookie('token', token, {
				httpOnly: true,
				secure: env.nodeEnv === 'production',
				sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
				maxAge: 1000 * 60 * 60 * 2,
			});

			res.status(200).json({ message: 'Login successful' });
		} catch (err) {
			res.status(500).json({ error: 'Error during login' });
		}
	},

	google: async (req: Request, res: Response) => {
		try {
			const { idToken } = req.body || {};
			if (!idToken) return res.status(400).json({ message: 'idToken is required' });
			if (!env.googleClientId) return res.status(500).json({ message: 'Google client not configured' });

			const client = new OAuth2Client(env.googleClientId);
			const ticket = await client.verifyIdToken({ idToken, audience: env.googleClientId });
			const payload = ticket.getPayload();
			if (!payload || !payload.email) return res.status(400).json({ message: 'Invalid Google token' });
			if (!payload.email_verified) return res.status(400).json({ message: 'Email not verified by Google' });

			const email = payload.email.toLowerCase();
			let user = await UserModel.findOne({ email });
			if (!user) {
				const tempPassword = crypto.randomBytes(16).toString('hex');
				const hashed = await hash(tempPassword, 10);
				const role = env.defaultUserRoleId; // default role from env
				user = await UserModel.create({
					name: payload.name || email,
					email,
					password: hashed,
					role,
				});
			}

			const token = generateToken({ id: user._id, email: user.email });
			res.cookie('token', token, {
				httpOnly: true,
				secure: env.nodeEnv === 'production',
				sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
				maxAge: 1000 * 60 * 60 * 2,
			});

			return res.status(200).json({ message: 'Login successful' });
		} catch (err) {
			return res.status(500).json({ error: 'Error during Google login' });
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

		res.status(200).json(req.user);
	},
};
