import express from 'express';
import api from './routes/api';
import cors from 'cors';
import cookieParser = require('cookie-parser');

export function createApp() {
	const app = express();
	app.use(express.json());
	app.use(cors());
	app.use(cookieParser());

	app.get('/health', (_req, res) => {
		res.json({ ok: true });
	});

	app.use('/api', api);

	return app;
}
