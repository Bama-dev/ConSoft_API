import { Request, Response } from 'express';
import { QuotationModel } from '../models/quotation.model';
import { ProductModel } from '../models/product.model';
import { AuthRequest } from '../middlewares/auth.middleware';

export const QuotationController = {
	// Crea o retorna un carrito activo para el usuario
	createOrGetCart: async (req: AuthRequest, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'Unauthorized' });

			let cart = await QuotationModel.findOne({ user: userId, status: 'carrito' }).populate('items.product');
			if (!cart) {
				cart = await QuotationModel.create({ user: userId, status: 'carrito', items: [] });
			}
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
			const prod = await ProductModel.findById(productId).select('_id');
			if (!prod) return res.status(404).json({ message: 'Product not found' });

			const quotation = await QuotationModel.findById(quotationId);
			if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
			if (String(quotation.user) !== String(userId)) {
				return res.status(403).json({ message: 'Forbidden' });
			}
			if (quotation.status !== 'carrito') {
				return res.status(400).json({ message: 'Cannot modify a non-cart quotation' });
			}

			quotation.items.push({
				product: prod._id,
				quantity: quantity ?? 1,
				color,
				size,
				notes,
			} as any);
			await quotation.save();
			const populated = await quotation.populate('items.product');
			return res.status(201).json({ ok: true, quotation: populated });
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

			const quotation = await QuotationModel.findById(quotationId);
			if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
			if (String(quotation.user) !== String(userId)) {
				return res.status(403).json({ message: 'Forbidden' });
			}
			if (quotation.status !== 'carrito') {
				return res.status(400).json({ message: 'Cannot modify a non-cart quotation' });
			}
			const item = quotation.items.id(itemId) as any;
			if (!item) return res.status(404).json({ message: 'Item not found' });

			if (quantity != null) item.quantity = quantity;
			if (color != null) item.color = color;
			if (size != null) item.size = size;
			if (notes != null) item.notes = notes;
			await quotation.save();
			const populated = await quotation.populate('items.product');
			return res.json({ ok: true, quotation: populated });
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

			const quotation = await QuotationModel.findById(quotationId);
			if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
			if (String(quotation.user) !== String(userId)) {
				return res.status(403).json({ message: 'Forbidden' });
			}
			if (quotation.status !== 'carrito') {
				return res.status(400).json({ message: 'Cannot modify a non-cart quotation' });
			}
			const item = quotation.items.id(itemId);
			if (!item) return res.status(404).json({ message: 'Item not found' });

			item.deleteOne();
			await quotation.save();
			const populated = await quotation.populate('items.product');
			return res.status(204).json({ ok: true, quotation: populated });
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
			const populated = await quotation.populate('items.product');
			return res.json({ ok: true, quotation: populated });
		} catch (err) {
			return res.status(500).json({ error: 'Error submitting quotation' });
		}
	},

	listMine: async (req: AuthRequest, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId) return res.status(401).json({ message: 'Unauthorized' });
			const quotations = await QuotationModel.find({ user: userId })
				.sort({ createdAt: -1 })
				.populate('items.product');
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
			if (String(quotation.user?._id ?? quotation.user) !== String(userId)) {
				// No es dueño; se asume validación de permisos en rutas para admin
			}
			return res.json(quotation);
		} catch (err) {
			return res.status(500).json({ error: 'Error getting quotation' });
		}
	},
};


