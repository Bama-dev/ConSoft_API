"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3000),
    mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/consoft',
    jwt_secret: process.env.JWT_SECRET ?? "alksdjklajlskd",
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    defaultUserRoleId: process.env.DEFAULT_USER_ROLE_ID ?? "68ccb444b45b03f1a65cbd26",
    adminRoleId: process.env.ADMIN_ROLE_ID,
    frontendOrigins: (process.env.FRONTEND_ORIGINS ?? 'http://localhost:3000')
        .split(',')
        .map((s) => s.trim()),
    // Email (SMTP) – opcional; si no está configurado, sendEmail hará no-op
    mailSmtpHost: process.env.MAIL_SMTP_HOST,
    mailSmtpPort: process.env.MAIL_SMTP_PORT ? Number(process.env.MAIL_SMTP_PORT) : undefined,
    mailSmtpUser: process.env.MAIL_SMTP_USER,
    mailSmtpPass: process.env.MAIL_SMTP_PASS,
    mailFrom: process.env.MAIL_FROM ?? 'no-reply@consoft.local',
    // Notificaciones
    adminNotifyEmail: process.env.ADMIN_NOTIFY_EMAIL,
};
