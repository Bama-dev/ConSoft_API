import request from 'supertest';
import { createApp } from '../src/app';
import { setupInMemoryMongo, teardownInMemoryMongo } from './setup-db';
import mongoose from 'mongoose';

describe('Orders, Payments, Sales flow', () => {
  const app = createApp();

  let userId: string;
  let orderId: string;

  beforeAll(async () => {
    await setupInMemoryMongo();
  });

  afterAll(async () => {
    await teardownInMemoryMongo();
  });

  it('creates a user, an order, pays it, and sees it in sales', async () => {
    const reg = await request(app)
      .post('/api/users')
      .send({ name: 'U', email: 'u@test.com', password: 'secret123' });
    expect(reg.status).toBe(201);

    const users = await request(app).get('/api/users');
    expect(users.status).toBe(200);
    userId = users.body.users ? users.body.users[0]._id : users.body[0]._id;

    const order = await request(app)
      .post('/api/orders')
      .send({ user: userId, type: 'service', status: 'created', items: [{ valor: 100000 }] });
    expect(order.status).toBe(201);
    orderId = order.body._id;

    const pay1 = await request(app)
      .post('/api/payments')
      .send({ orderId, amount: 40000, paidAt: new Date().toISOString(), method: 'cash', status: 'confirmed' });
    expect(pay1.status).toBe(201);

    const pay2 = await request(app)
      .post('/api/payments')
      .send({ orderId, amount: 60000, paidAt: new Date().toISOString(), method: 'cash', status: 'confirmed' });
    expect(pay2.status).toBe(201);

    const sales = await request(app).get('/api/sales');
    expect(sales.status).toBe(200);
    expect(sales.body.ok).toBe(true);
    expect(Array.isArray(sales.body.sales)).toBe(true);
    const found = sales.body.sales.find((s: any) => s._id === orderId);
    expect(found).toBeTruthy();
    expect(found.restante).toBe(0);
  });
});


