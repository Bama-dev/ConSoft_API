import request from 'supertest';
import { createApp } from '../src/app';
import { setupInMemoryMongo, teardownInMemoryMongo } from './setup-db';

describe('Permissions update/delete', () => {
  const app = createApp();
  let permId: string;

  beforeAll(async () => {
    await setupInMemoryMongo();
  });

  afterAll(async () => {
    await teardownInMemoryMongo();
  });

  it('creates permission', async () => {
    const res = await request(app).post('/api/permissions').send({ module: 'orders', action: 'read' });
    expect(res.status).toBe(201);
    permId = res.body._id;
  });

  it('updates permission (handles unique constraint)', async () => {
    const res = await request(app).put(`/api/permissions/${permId}`).send({ action: 'list' });
    expect([200, 409]).toContain(res.status);
  });

  it('deletes permission', async () => {
    const res = await request(app).delete(`/api/permissions/${permId}`);
    expect(res.status).toBe(204);
  });
});


