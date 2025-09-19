import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { UserController } from '../controllers/users.controller';
import { AuthController } from '../controllers/auth.controller';
import { CategoryControlleer } from '../controllers/category.controller';
import { ProductController } from '../controllers/product.controller';
import { ServiceController } from '../controllers/service.controller';
import { VisitController } from '../controllers/visit.controller';
import { OrderController } from '../controllers/orderController';
import { PaymentController } from '../controllers/payment.controller';
import { SaleController } from '../controllers/sales.controller';

const router = Router();

function mountCrud(path: string, controller: any) {
	if (controller.list) router.get(`/${path}`, controller.list);
	if (controller.get) router.get(`/${path}/:id`, controller.get);
	if (controller.create) router.post(`/${path}`, controller.create);
	if (controller.update) router.put(`/${path}/:id`, controller.update);
	if (controller.remove) router.delete(`/${path}/:id`, controller.remove);
}

router.post('/auth/login', AuthController.login);
router.post('/auth/register', AuthController.register);
router.post('/auth/logout', AuthController.logout);

mountCrud('roles', RoleController);
mountCrud('users', UserController);
mountCrud('categories', CategoryControlleer);
mountCrud('product', ProductController);
mountCrud('services', ServiceController);
mountCrud('visits', VisitController);
mountCrud('orders', OrderController);
mountCrud('paymets', PaymentController);
mountCrud('sales', SaleController);

export default router;
