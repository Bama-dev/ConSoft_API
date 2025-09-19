import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function generateToken(payload: object, expiresIn: string | number = '1h') {
	return jwt.sign(payload, env.jwt_secret as jwt.Secret, { expiresIn } as jwt.SignOptions);
}
