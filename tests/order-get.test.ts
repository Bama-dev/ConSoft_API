import request from 'supertest';
import { createApp } from '../src/app';
import { setupInMemoryMongo, teardownInMemoryMongo } from './setup-db';

describe('Order get with totals', () => {
  const app = createApp();
  let orderId: string;
  let userId: string;

  beforeAll(async () => {
    await setupInMemoryMongo();
  });

  afterAll(async () => {
    await teardownInMemoryMongo();
  });

  it('creates user and order, then gets populated order with totals', async () => {
    const reg = await request(app).post('/api/users').send({ name: 'O', email: 'o@test.com', password: 'secret123' });
    expect(reg.status).toBe(201);

    const users = await request(app).get('/api/users');
    userId = users.body.users ? users.body.users[0]._id : users.body[0]._id;

    const order = await request(app)
      .post('/api/orders')
      .send({ user: userId, type: 'service', status: 'created', items: [{ valor: 1000 }, { valor: 500 }] });
    expect(order.status).toBe(201);
    orderId = order.body._id;

    const got = await request(app).get(`/api/orders/${orderId}`);
    expect(got.status).toBe(200);
    expect(got.body.total).toBe(1500);
    expect(got.body.paid).toBe(0);
    expect(got.body.restante).toBe(1500);
  });
});


