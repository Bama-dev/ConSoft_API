import express from 'express';
import api from './routes/api';
import cors from 'cors';
import cookieParser = require('cookie-parser');
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';

export function createApp() {
	const app = express();
	app.set('trust proxy', 1);
	app.use(helmet());
	app.use(express.json());
    app.use(cors({
        origin: (origin, cb) => {
            if (!origin) return cb(null, true);
            if (env.frontendOrigins.includes(origin)) return cb(null, true);
            return cb(new Error('Not allowed by CORS'));
        },
        credentials: true
    }));
	app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
	app.use(cookieParser());

	app.get('/health', (_req, res) => {
		res.json({ ok: true });
	});

	app.use('/api', api);

	// Global error handler
	app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
		console.error(err);
		const status = err.status || 500;
		res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
	});

	return app;
}
