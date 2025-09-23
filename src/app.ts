import express from 'express';
import api from './routes/api';
import cors from 'cors';
import { env } from './config/env';
import cookieParser = require('cookie-parser');

export function createApp() {
	const app = express();
	app.use(express.json());
	app.use(cors({
		origin: (origin, cb) => {
			if (!origin) return cb(null, true);
			if (env.frontendOrigins.includes(origin)) return cb(null, true);
			return cb(new Error('Not allowed by CORS'));
		},
		credentials: true
	}));
	app.use(cookieParser());

	app.get('/health', (_req, res) => {
		res.json({ ok: true });
	});

	app.use('/api', api);

	return app;
}
