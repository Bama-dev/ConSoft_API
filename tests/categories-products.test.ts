import request from 'supertest';
import { createApp } from '../src/app';
import { setupInMemoryMongo, teardownInMemoryMongo } from './setup-db';

describe('Categories & Products CRUD', () => {
  const app = createApp();
  let categoryId: string;
  let productId: string;

  beforeAll(async () => {
    await setupInMemoryMongo();
  });

  afterAll(async () => {
    await teardownInMemoryMongo();
  });

  it('creates a category', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({ name: 'Sofas', description: 'Sofa category' });
    expect(res.status).toBe(201);
    categoryId = res.body._id;
  });

  it('creates a product linked to category', async () => {
    const res = await request(app)
      .post('/api/product')
      .send({ name: 'Sofa L', description: 'Large', category: categoryId, status: true });
    expect(res.status).toBe(201);
    productId = res.body._id;
  });

  it('lists products', async () => {
    const res = await request(app).get('/api/product');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('updates a product', async () => {
    const res = await request(app)
      .put(`/api/product/${productId}`)
      .send({ description: 'Large premium' });
    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Large premium');
  });

  it('deletes a product', async () => {
    const res = await request(app)
      .delete(`/api/product/${productId}`);
    expect(res.status).toBe(204);
  });
});


