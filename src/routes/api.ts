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

const router = Router();

function mountCrud(path: string, controller: any) {
	if (controller.list) router.get(`/${path}`, controller.list);
	if (controller.get) router.get(`/${path}/:id`, controller.get);
	if (controller.create) router.post(`/${path}`, controller.create);
	if (controller.update) router.put(`/${path}/:id`, controller.update);
	if (controller.remove) router.delete(`/${path}/:id`, controller.remove);
}

router.post('/auth/login', AuthController.login);
router.post('/auth/logout', AuthController.logout);
router.get('/auth/me', verifyToken, AuthController.me);
router.post('/auth/google', AuthController.google);

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

export default router;
