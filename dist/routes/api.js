"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const role_controller_1 = require("../controllers/role.controller");
const users_controller_1 = require("../controllers/users.controller");
const auth_controller_1 = require("../controllers/auth.controller");
const category_controller_1 = require("../controllers/category.controller");
const product_controller_1 = require("../controllers/product.controller");
const service_controller_1 = require("../controllers/service.controller");
const visit_controller_1 = require("../controllers/visit.controller");
const order_Controller_1 = require("../controllers/order.Controller");
const payment_controller_1 = require("../controllers/payment.controller");
const sales_controller_1 = require("../controllers/sales.controller");
const permission_controller_1 = require("../controllers/permission.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
function mountCrud(path, controller) {
    if (controller.list)
        router.get(`/${path}`, controller.list);
    if (controller.get)
        router.get(`/${path}/:id`, controller.get);
    if (controller.create)
        router.post(`/${path}`, controller.create);
    if (controller.update)
        router.put(`/${path}/:id`, controller.update);
    if (controller.remove)
        router.delete(`/${path}/:id`, controller.remove);
}
router.post('/auth/login', auth_controller_1.AuthController.login);
router.post('/auth/logout', auth_controller_1.AuthController.logout);
router.get('/auth/me', auth_middleware_1.verifyToken, auth_controller_1.AuthController.me);
router.post('/auth/google', auth_controller_1.AuthController.google);
mountCrud('roles', role_controller_1.RoleController);
mountCrud('users', users_controller_1.UserController);
mountCrud('categories', category_controller_1.CategoryControlleer);
mountCrud('product', product_controller_1.ProductController);
mountCrud('services', service_controller_1.ServiceController);
mountCrud('visits', visit_controller_1.VisitController);
mountCrud('orders', order_Controller_1.OrderController);
mountCrud('payments', payment_controller_1.PaymentController);
mountCrud('sales', sales_controller_1.SaleController);
mountCrud('permissions', permission_controller_1.PermissionController);
exports.default = router;
