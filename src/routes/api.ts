import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { UserController } from '../controllers/users.controller';
import { AuthController } from '../controllers/auth.controller';
import { CategoryControlleer } from '../controllers/category.controller';
import { ProductController } from '../controllers/product.controller';
import { ServiceController } from '../controllers/service.controller';
import { VisitController } from '../controllers/visit.controller';
import { OrderController } from '../controllers/order.Controller';
import { PaymentController } from '../controllers/payment.controller';
import { SaleController } from '../controllers/sales.controller';
import { PermissionController } from '../controllers/permission.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { verifyRole } from '../middlewares/verifyRole';
import { QuotationController } from '../controllers/quotation.controller';
import { ChatController } from '../controllers/chat.controller';

const router = Router();

function mountCrud(path: string, controller: any) {
	if (controller.list) router.get(`/${path}`, verifyRole(path, 'view'), controller.list);
	if (controller.get) router.get(`/${path}/:id`, verifyRole(path, 'view'), controller.get);
	if (controller.create) router.post(`/${path}`, verifyRole(path, 'create'), controller.create);
	if (controller.update)
		router.put(`/${path}/:id`, verifyRole(path, 'update'), controller.update);
	if (controller.remove)
		router.delete(`/${path}/:id`, verifyRole(path, 'delete'), controller.remove);
}

// === RUTAS PUBLICAS === //
router.post('/auth/login', AuthController.login);
router.post('/auth/logout', AuthController.logout);
router.get('/auth/me', verifyToken, AuthController.me);
router.post('/auth/google', AuthController.google);

// === RUTAS PROTEGIDAS === //
router.use(verifyToken);

mountCrud('roles', RoleController);
mountCrud('users', UserController);
mountCrud('categories', CategoryControlleer);
mountCrud('products', ProductController);
mountCrud('services', ServiceController);
mountCrud('visits', VisitController);
mountCrud('orders', OrderController);
mountCrud('payments', PaymentController);
mountCrud('sales', SaleController);
mountCrud('permissions', PermissionController);

// === COTIZACIONES (protegidas sólo por autenticación; permisos finos se pueden agregar luego) === //
router.get('/quotations/mine', QuotationController.listMine);
router.post('/quotations/cart', QuotationController.createOrGetCart);
router.post('/quotations/quick', QuotationController.quickCreate);
router.post('/quotations/:id/items', QuotationController.addItem);
router.put('/quotations/:id/items/:itemId', QuotationController.updateItem);
router.delete('/quotations/:id/items/:itemId', QuotationController.removeItem);
router.post('/quotations/:id/submit', QuotationController.submit);
router.post('/quotations/:id/quote', verifyRole('quotations', 'update'), QuotationController.adminSetQuote);
router.post('/quotations/:id/decision', QuotationController.userDecision);
router.get('/quotations', verifyRole('quotations', 'view'), QuotationController.listAll);
router.get('/quotations/:id', QuotationController.get);
router.get('/quotations/:quotationId/messages', ChatController.listMessages);

export default router;
