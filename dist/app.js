"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const api_1 = __importDefault(require("./routes/api"));
const cors_1 = __importDefault(require("cors"));
const cookieParser = require("cookie-parser");
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
function createApp() {
    const app = (0, express_1.default)();
    app.set('trust proxy', 1);
    app.use((0, helmet_1.default)());
    app.use(express_1.default.json());
    app.use((0, cors_1.default)({
        origin: (origin, cb) => {
            if (!origin)
                return cb(null, true);
            if (env_1.env.frontendOrigins.includes(origin))
                return cb(null, true);
            return cb(new Error('Not allowed by CORS'));
        },
        credentials: true
    }));
    app.use((0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 100 }));
    app.use(cookieParser());
    app.get('/health', (_req, res) => {
        res.json({ ok: true });
    });
    app.use('/api', api_1.default);
    // Global error handler
    app.use((err, _req, res, _next) => {
        console.error(err);
        const status = err.status || 500;
        res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
    });
    return app;
}
