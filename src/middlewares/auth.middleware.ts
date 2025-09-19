import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthRequest extends Request {
	user?: any;
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
	try {
		const token = req.cookies?.token;

		if (!token) {
			return res.status(401).json({ message: 'Acces denied. No token provided' });
		}

		const secret: Secret = env.jwt_secret;
		const decoded = jwt.verify(token, secret);

		req.user = decoded;
		next();
	} catch (err) {
		return res.status(403).json({ message: 'Invalid or expired token' });
	}
}
