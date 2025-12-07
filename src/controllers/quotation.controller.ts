import { Request, Response } from 'express';
import { QuotationModel } from '../models/quotation.model';
import { ProductModel } from '../models/product.model';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendEmail } from '../utils/mailer';
import { env } from '../config/env';
import { OrderModel } from '../models/order.model';

export const QuotationController = {
	// Flujo "cotizar" directo desde un producto (una sola llamada)
	quickCreate: async (req: AuthRequest, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'Unauthorized' });
			const { productId, quantity, color, size, notes } = req.body ?? {};
			if (!productId) return res.status(400).json({ message: 'productId is required' });
			if (quantity != null && (!Number.isFinite(Number(quantity)) || Number(quantity) < 1)) {
				return res.status(400).json({ message: 'quantity must be a positive number' });
			}
			const prod = await ProductModel.findById(productId).select('_id');
			if (!prod) return res.status(404).json({ message: 'Product not found' });

			const quotation = await QuotationModel.create({
				user: userId,
				status: 'solicitada',
				items: [{ product: prod._id, quantity: quantity ?? 1, color, size, notes }],
			});
			const populated = await quotation.populate('items.product').then((doc) => doc.populate('user', 'name email'));
			return res.status(201).json({ ok: true, quotation: populated });
		} catch (err) {
			return res.status(500).json({ error: 'Error creating quick quotation' });
		}
	},

	// Crea o retorna un carrito activo para el usuario
	createOrGetCart: async (req: AuthRequest, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'Unauthorized' });

			// Operación atómica: crea si no existe, o devuelve el existente
			const cart = await QuotationModel.findOneAndUpdate(
				{ user: userId, status: 'carrito' },
				{ $setOnInsert: { user: userId, status: 'carrito', items: [] } },
				{ new: true, upsert: true }
			).populate('items.product').populate('user', 'name email');
			return res.json({ ok: true, cart });
		} catch (err) {
			return res.status(500).json({ error: 'Error creating/getting cart' });
		}
	},

	addItem: async (req: AuthRequest, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'Unauthorized' });
			const quotationId = req.params.id;
			const { productId, quantity, color, size, notes } = req.body;

			if (!productId) return res.status(400).json({ message: 'productId is required' });
			if (quantity != null && (!Number.isFinite(Number(quantity)) || Number(quantity) < 1)) {
				return res.status(400).json({ message: 'quantity must be a positive number' });
			}
			const prod = await ProductModel.findById(productId).select('_id');
			if (!prod) return res.status(404).json({ message: 'Product not found' });

			// Operación atómica: push al array si es del usuario y está en 'carrito'
			const updated = await QuotationModel.findOneAndUpdate(
				{ _id: quotationId, user: userId, status: 'carrito' },
				{
					$push: {
						items: {
							product: prod._id,
							quantity: quantity ?? 1,
							color,
							size,
							notes,
						},
					},
				},
				{ new: true }
			).populate('items.product').populate('user', 'name email');
			if (!updated) {
				return res.status(400).json({ message: 'Cannot modify quotation (not found or not a cart owned by user)' });
			}
			return res.status(201).json({ ok: true, quotation: updated });
		} catch (err) {
			return res.status(500).json({ error: 'Error adding item' });
		}
	},

	updateItem: async (req: AuthRequest, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'Unauthorized' });
			const quotationId = req.params.id;
			const itemId = req.params.itemId;
			const { quantity, color, size, notes } = req.body ?? {};

			if (quantity != null && (!Number.isFinite(Number(quantity)) || Number(quantity) < 1)) {
				return res.status(400).json({ message: 'quantity must be a positive number' });
			}
			const setOps: any = {};
			if (quantity != null) setOps['items.$.quantity'] = quantity;
			if (color != null) setOps['items.$.color'] = color;
			if (size != null) setOps['items.$.size'] = size;
			if (notes != null) setOps['items.$.notes'] = notes;

			const updated = await QuotationModel.findOneAndUpdate(
				{ _id: quotationId, user: userId, status: 'carrito', 'items._id': itemId },
				{ $set: setOps },
				{ new: true }
			).populate('items.product').populate('user', 'name email');
			if (!updated) {
				return res.status(404).json({ message: 'Quotation or item not found, or not a cart' });
			}
			return res.json({ ok: true, quotation: updated });
		} catch (err) {
			return res.status(500).json({ error: 'Error updating item' });
		}
	},

	removeItem: async (req: AuthRequest, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'Unauthorized' });
			const quotationId = req.params.id;
			const itemId = req.params.itemId;

			const updated = await QuotationModel.findOneAndUpdate(
				{ _id: quotationId, user: userId, status: 'carrito' },
				{ $pull: { items: { _id: itemId } } },
				{ new: true }
			).populate('items.product').populate('user', 'name email');
			if (!updated) {
				return res.status(404).json({ message: 'Quotation not found or not a cart' });
			}
			return res.status(200).json({ ok: true, quotation: updated });
		} catch (err) {
			return res.status(500).json({ error: 'Error removing item' });
		}
	},

	submit: async (req: AuthRequest, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'Unauthorized' });
			const quotationId = req.params.id;

			const quotation = await QuotationModel.findById(quotationId);
			if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
			if (String(quotation.user) !== String(userId)) {
				return res.status(403).json({ message: 'Forbidden' });
			}
			if (quotation.items.length === 0) {
				return res.status(400).json({ message: 'Cart is empty' });
			}
			quotation.status = 'solicitada';
			await quotation.save();
			const populated = await quotation.populate('items.product').then((doc) => doc.populate('user', 'name email'));
			return res.json({ ok: true, quotation: populated });
		} catch (err) {
			return res.status(500).json({ error: 'Error submitting quotation' });
		}
	},

	// Admin fija precio/respuesta de cotización
	adminSetQuote: async (req: AuthRequest, res: Response) => {
		try {
			const { id } = req.params;
			const { totalEstimate, adminNotes } = req.body ?? {};
			const quotation = await QuotationModel.findById(id).populate('user', 'email');
			if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
			if (
				totalEstimate == null ||
				!Number.isFinite(Number(totalEstimate)) ||
				Number(totalEstimate) < 0
			) {
				return res
					.status(400)
					.json({ message: 'totalEstimate must be a non-negative number' });
			}
			quotation.totalEstimate = totalEstimate;
			if (adminNotes != null) quotation.adminNotes = adminNotes;
			quotation.status = 'cotizada';
			await quotation.save();

			// Notificar al usuario por correo
			const ownerEmail = (quotation.user as any)?.email;
			if (ownerEmail) {
				const linkBase = env.frontendOrigins[0] || 'http://localhost:3000';
				const link = `${linkBase}/cotizaciones/${quotation._id}`;
				await sendEmail({
					to: ownerEmail,
					subject: 'Tienes una cotización lista para revisar',
					text: `Tu cotización está lista. Revísala aquí: ${link}`,
					html: `<p>Tu cotización está lista.</p><p><a href="${link}">Ver cotización</a></p>`,
				});
			}
			return res.json({ ok: true, quotation });
		} catch (err) {
			return res.status(500).json({ error: 'Error setting quote' });
		}
	},

	// Usuario decide aceptar o rechazar
	userDecision: async (req: AuthRequest, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'Unauthorized' });
			const { id } = req.params;
			const { decision } = req.body ?? {}; // 'accept' | 'reject'
			if (!decision || !['accept', 'reject'].includes(decision)) {
				return res.status(400).json({ message: 'decision must be accept|reject' });
			}
			const quotation = await QuotationModel.findById(id).populate('user', 'email');
			if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
			const ownerId = String((quotation.user as any)?._id ?? quotation.user);
			if (ownerId !== String(userId)) {
				return res.status(403).json({ message: 'Forbidden' });
			}
			if (decision === 'accept') {
				quotation.status = 'en_proceso';
				// Crear pedido si no existe uno derivado de esta cotización (heurística simple)
				const existingOrder = await OrderModel.findOne({
					user: quotation.user as any,
					status: 'en_proceso',
					startedAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, // últimos 5 minutos
				});
				if (!existingOrder) {
					const total = Number(quotation.totalEstimate ?? 0);
					await OrderModel.create({
						user: quotation.user as any,
						status: 'en_proceso',
						startedAt: new Date(),
						items: [
							{
								detalles: `Cotización ${
									quotation.adminNotes ? ' - ' + quotation.adminNotes : ''
								}`,
								valor: total > 0 ? total : undefined,
								id_servicio: "68d47cf4da9d98534c933ff9"
							},
						],
					} as any);
				}
			} else {
				quotation.status = 'cerrada';
			}
			await quotation.save();

			// Notificar al admin
			const to = env.adminNotifyEmail || env.mailFrom;
			if (to) {
				const linkBase = env.frontendOrigins[0] || 'http://localhost:3000';
				const link = `${linkBase}/cotizaciones/${quotation._id}`;
				await sendEmail({
					to,
					subject: `Decisión del cliente: ${
						decision === 'accept' ? 'ACEPTÓ' : 'RECHAZÓ'
					} la cotización`,
					text: `El cliente ha ${
						decision === 'accept' ? 'aceptado' : 'rechazado'
					} la cotización. ${link}`,
					html: `<p>El cliente ha <strong>${
						decision === 'accept' ? 'aceptado' : 'rechazado'
					}</strong> la cotización.</p><p><a href="${link}">Ver cotización</a></p>`,
				});
			}
			// Eliminar mensajes de chat y la cotización para permitir nuevas solicitudes
			try {
				const { ChatMessageModel } = await import('../models/chatMessage.model');
				await ChatMessageModel.deleteMany({ quotation: quotation._id });
			} catch (_e) {
				// no-op si el modelo no está disponible por alguna razón
			}
			await QuotationModel.deleteOne({ _id: quotation._id });
			return res.json({ ok: true, deleted: true, quotationId: String(quotation._id) });
		} catch (err) {
			return res.status(500).json({ error: 'Error applying decision' });
		}
	},

	listMine: async (req: AuthRequest, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'Unauthorized' });
			const quotations = await QuotationModel.find({ user: userId })
				.sort({ createdAt: -1 })
				.populate('items.product')
				.populate('user', 'name email');
			return res.json({ ok: true, quotations });
		} catch (err) {
			return res.status(500).json({ error: 'Error getting quotations' });
		}
	},

	listAll: async (_req: Request, res: Response) => {
		try {
			const quotations = await QuotationModel.find()
				.sort({ createdAt: -1 })
				.populate('user', 'name email')
				.populate('items.product');
			return res.json({ ok: true, quotations });
		} catch (err) {
			return res.status(500).json({ error: 'Error getting quotations' });
		}
	},

	get: async (req: AuthRequest, res: Response) => {
		try {
			const id = req.params.id;
			const userId = req.user?.id;
			const quotation = await QuotationModel.findById(id)
				.populate('user', 'name email')
				.populate('items.product');
			if (!quotation) return res.status(404).json({ message: 'Not found' });

			// Permitir al dueño o a quien tenga permisos (validación adicional se puede hacer en ruta con verifyRole)
			const ownerIdForGet = String((quotation.user as any)?._id ?? quotation.user);
			if (ownerIdForGet !== String(userId)) {
				// No es dueño; se asume validación de permisos en rutas para admin
			}
			return res.json(quotation);
		} catch (err) {
			return res.status(500).json({ error: 'Error getting quotation' });
		}
	},
};
