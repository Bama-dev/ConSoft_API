import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env';
import jwt from 'jsonwebtoken';
import { ChatMessageModel } from '../models/chatMessage.model';
import { QuotationModel } from '../models/quotation.model';
import { UserModel } from '../models/user.model';
import { sendEmail } from '../utils/mailer';

interface JwtPayload {
	id: string;
	email: string;
	role?: any;
}

export function initSocket(server: HttpServer) {
	const io = new Server(server, {
		cors: {
			origin: env.frontendOrigins,
			credentials: true,
		},
	});

	io.use((socket, next) => {
		try {
			const token = (socket.handshake.auth as any)?.token || (socket.handshake.query as any)?.token;
			if (!token) return next(new Error('Unauthorized'));
			const decoded = jwt.verify(token, env.jwt_secret) as JwtPayload;
			(socket as any).user = decoded;
			return next();
		} catch (err) {
			return next(new Error('Unauthorized'));
		}
	});

	io.on('connection', (socket) => {
		const user = (socket as any).user as JwtPayload;
		const joinedRooms = new Set<string>();

		const canAccessQuotation = async (quotationId: string): Promise<{ ok: boolean; ownerId?: string; ownerEmail?: string }> => {
			const quotation = await QuotationModel.findById(quotationId).select('user').populate('user', 'email');
			if (!quotation) return { ok: false };
			const ownerId = String((quotation.user as any)?._id ?? quotation.user);
			if (ownerId === String(user.id)) return { ok: true, ownerId, ownerEmail: (quotation.user as any)?.email };
			// Si no es dueño, permitimos si parece admin (posee permiso de ver cotizaciones)
			const perms = (user.role?.permissions as any[]) || [];
			const hasAdminPerm = perms.some((perm: any) => {
				if (typeof perm?.name === 'string') {
					return perm.name === 'quotations.view' || perm.name === 'quotations.write';
				}
				if (typeof perm?.module === 'string' && typeof perm?.action === 'string') {
					return perm.module === 'quotations' && (perm.action === 'view' || perm.action === 'write' || perm.action === 'update');
				}
				return false;
			});
			return hasAdminPerm ? { ok: true, ownerId, ownerEmail: (quotation.user as any)?.email } : { ok: false };
		};

		socket.on('quotation:join', ({ quotationId }: { quotationId: string }) => {
			(async () => {
				if (!quotationId) return;
				const access = await canAccessQuotation(quotationId);
				if (!access.ok) return;
				const room = `q:${quotationId}`;
				socket.join(room);
				joinedRooms.add(room);
			})().catch(() => {});
		});

		socket.on('chat:message', async (payload: { quotationId: string; message: string }) => {
			try {
				if (!payload?.quotationId || !payload?.message) return;
				const access = await canAccessQuotation(payload.quotationId);
				if (!access.ok) return;
				const msg = await ChatMessageModel.create({
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
					const linkBase = env.frontendOrigins[0] || 'http://localhost:3000';
					const link = `${linkBase}/cotizaciones/${payload.quotationId}`;
					await sendEmail({
						to: access.ownerEmail,
						subject: 'Nueva respuesta a tu cotización',
						text: `Tienes una nueva respuesta de nuestro equipo. Ingresa aquí: ${link}`,
						html: `<p>Tienes una nueva respuesta de nuestro equipo.</p><p><a href="${link}">Ver cotización</a></p>`,
					});
				}
			} catch (err) {
				// swallow
			}
		});
	});

	return io;
}


