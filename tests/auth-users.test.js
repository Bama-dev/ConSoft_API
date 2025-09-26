"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
const setup_db_1 = require("./setup-db");
describe('Auth & Users', () => {
    const app = (0, app_1.createApp)();
    beforeAll(async () => {
        await (0, setup_db_1.setupInMemoryMongo)();
    });
    afterAll(async () => {
        await (0, setup_db_1.teardownInMemoryMongo)();
    });
    it('registers a user and uses cookie auth for /me', async () => {
        const register = await (0, supertest_1.default)(app)
            .post('/api/users')
            .send({ name: 'Admin', email: 'admin@test.com', password: 'secret123' });
        expect(register.status).toBe(200);
        const login = await (0, supertest_1.default)(app)
            .post('/api/auth/login')
            .send({ email: 'admin@test.com', password: 'secret123' });
        expect(login.status).toBe(200);
        const cookies = login.headers['set-cookie'];
        expect(cookies).toBeDefined();
        const me = await (0, supertest_1.default)(app)
            .get('/api/auth/me')
            .set('Cookie', cookies);
        expect(me.status).toBe(200);
        expect(me.body.email).toBe('admin@test.com');
    });
});
