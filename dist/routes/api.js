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
const verifyRole_1 = require("../middlewares/verifyRole");
const quotation_controller_1 = require("../controllers/quotation.controller");
const chat_controller_1 = require("../controllers/chat.controller");
const router = (0, express_1.Router)();
function mountCrud(path, controller) {
    if (controller.list)
        router.get(`/${path}`, (0, verifyRole_1.verifyRole)(path, 'view'), controller.list);
    if (controller.get)
        router.get(`/${path}/:id`, (0, verifyRole_1.verifyRole)(path, 'view'), controller.get);
    if (controller.create)
        router.post(`/${path}`, (0, verifyRole_1.verifyRole)(path, 'create'), controller.create);
    if (controller.update)
        router.put(`/${path}/:id`, (0, verifyRole_1.verifyRole)(path, 'update'), controller.update);
    if (controller.remove)
        router.delete(`/${path}/:id`, (0, verifyRole_1.verifyRole)(path, 'delete'), controller.remove);
}
// === RUTAS PUBLICAS === //
router.post('/auth/login', auth_controller_1.AuthController.login);
router.post('/auth/logout', auth_controller_1.AuthController.logout);
router.get('/auth/me', auth_middleware_1.verifyToken, auth_controller_1.AuthController.me);
router.post('/auth/google', auth_controller_1.AuthController.google);
// === RUTAS PROTEGIDAS === //
router.use(auth_middleware_1.verifyToken);
mountCrud('roles', role_controller_1.RoleController);
mountCrud('users', users_controller_1.UserController);
mountCrud('categories', category_controller_1.CategoryControlleer);
mountCrud('products', product_controller_1.ProductController);
mountCrud('services', service_controller_1.ServiceController);
mountCrud('visits', visit_controller_1.VisitController);
mountCrud('orders', order_Controller_1.OrderController);
mountCrud('payments', payment_controller_1.PaymentController);
mountCrud('sales', sales_controller_1.SaleController);
mountCrud('permissions', permission_controller_1.PermissionController);
// === COTIZACIONES (protegidas sólo por autenticación; permisos finos se pueden agregar luego) === //
router.get('/quotations/mine', quotation_controller_1.QuotationController.listMine);
router.post('/quotations/cart', quotation_controller_1.QuotationController.createOrGetCart);
router.post('/quotations/quick', quotation_controller_1.QuotationController.quickCreate);
router.post('/quotations/:id/items', quotation_controller_1.QuotationController.addItem);
router.put('/quotations/:id/items/:itemId', quotation_controller_1.QuotationController.updateItem);
router.delete('/quotations/:id/items/:itemId', quotation_controller_1.QuotationController.removeItem);
router.post('/quotations/:id/submit', quotation_controller_1.QuotationController.submit);
router.post('/quotations/:id/quote', (0, verifyRole_1.verifyRole)('quotations', 'update'), quotation_controller_1.QuotationController.adminSetQuote);
router.post('/quotations/:id/decision', quotation_controller_1.QuotationController.userDecision);
router.get('/quotations', (0, verifyRole_1.verifyRole)('quotations', 'view'), quotation_controller_1.QuotationController.listAll);
router.get('/quotations/:id', quotation_controller_1.QuotationController.get);
router.get('/quotations/:quotationId/messages', chat_controller_1.ChatController.listMessages);
exports.default = router;
