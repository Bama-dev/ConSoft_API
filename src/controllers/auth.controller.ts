import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { compare, hash } from 'bcrypt';
import { generateToken } from '../utils/jwt';
import { env } from '../config/env';

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
				secure: env.nodeEnv === 'production',
				sameSite: 'strict',
				maxAge: 1000 * 60 * 60 * 2,
			});

			res.json({ message: 'Login successful' });
		} catch (err) {
			res.status(500).json({ error: 'Error during login' });
		}
	},

	register: async (req: Request, res: Response) => {
		try {
			const { name, email, password, role = 'common' } = req.body;

			const existing = await UserModel.findOne({ email });

			if (existing) {
				return res.status(400).json({ message: 'This email is already in use' });
			}

			const hashedPass = await hash(password, 10);

			const userData = {
				name,
				email,
				password: hashedPass,
				role,
			};

			const newUser = await UserModel.create(userData);

			res.json({ message: 'User registered successfully' });
		} catch (err) {
			console.log(err);
			res.status(500).json({ error: 'Error during register' });
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
};
