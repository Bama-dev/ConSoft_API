"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
const socket_io_1 = require("socket.io");
const env_1 = require("../config/env");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const chatMessage_model_1 = require("../models/chatMessage.model");
const quotation_model_1 = require("../models/quotation.model");
const mailer_1 = require("../utils/mailer");
function initSocket(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: env_1.env.frontendOrigins,
            credentials: true,
        },
    });
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.query?.token;
            if (!token)
                return next(new Error('Unauthorized'));
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwt_secret);
            socket.user = decoded;
            return next();
        }
        catch (err) {
            return next(new Error('Unauthorized'));
        }
    });
    io.on('connection', (socket) => {
        const user = socket.user;
        const joinedRooms = new Set();
        const canAccessQuotation = async (quotationId) => {
            const quotation = await quotation_model_1.QuotationModel.findById(quotationId).select('user').populate('user', 'email');
            if (!quotation)
                return { ok: false };
            const ownerId = String(quotation.user?._id ?? quotation.user);
            if (ownerId === String(user.id))
                return { ok: true, ownerId, ownerEmail: quotation.user?.email };
            // Si no es dueño, permitimos si parece admin (posee permiso de ver cotizaciones)
            const perms = user.role?.permissions || [];
            const hasAdminPerm = perms.some((perm) => {
                if (typeof perm?.name === 'string') {
                    return perm.name === 'quotations.view' || perm.name === 'quotations.write';
                }
                if (typeof perm?.module === 'string' && typeof perm?.action === 'string') {
                    return perm.module === 'quotations' && (perm.action === 'view' || perm.action === 'write' || perm.action === 'update');
                }
                return false;
            });
            return hasAdminPerm ? { ok: true, ownerId, ownerEmail: quotation.user?.email } : { ok: false };
        };
        socket.on('quotation:join', ({ quotationId }) => {
            (async () => {
                if (!quotationId)
                    return;
                const access = await canAccessQuotation(quotationId);
                if (!access.ok)
                    return;
                const room = `q:${quotationId}`;
                socket.join(room);
                joinedRooms.add(room);
            })().catch(() => { });
        });
        socket.on('chat:message', async (payload) => {
            try {
                if (!payload?.quotationId || !payload?.message)
                    return;
                const access = await canAccessQuotation(payload.quotationId);
                if (!access.ok)
                    return;
                const msg = await chatMessage_model_1.ChatMessageModel.create({
                    quotation: payload.quotationId,
                    sender: user.id,
                    message: payload.message,
                });
                io.to(`q:${payload.quotationId}`).emit('chat:message', {
                    _id: String(msg._id),
                    quotation: payload.quotationId,
                    sender: user.id,
                    message: payload.message,
                    sentAt: msg.sentAt,
                });
                // Notificación por correo al dueño si quien escribe no es el dueño (p. ej., admin/equipo)
                if (access.ownerId && String(access.ownerId) !== String(user.id) && access.ownerEmail) {
                    const linkBase = env_1.env.frontendOrigins[0] || 'http://localhost:3000';
                    const link = `${linkBase}/cotizaciones/${payload.quotationId}`;
                    await (0, mailer_1.sendEmail)({
                        to: access.ownerEmail,
                        subject: 'Nueva respuesta a tu cotización',
                        text: `Tienes una nueva respuesta de nuestro equipo. Ingresa aquí: ${link}`,
                        html: `<p>Tienes una nueva respuesta de nuestro equipo.</p><p><a href="${link}">Ver cotización</a></p>`,
                    });
                }
            }
            catch (err) {
                // swallow
            }
        });
    });
    return io;
}
