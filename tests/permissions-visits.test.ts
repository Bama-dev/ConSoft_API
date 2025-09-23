import request from 'supertest';
import { createApp } from '../src/app';
import { setupInMemoryMongo, teardownInMemoryMongo } from './setup-db';
import mongoose from 'mongoose';

describe('Permissions & Visits', () => {
  const app = createApp();

  beforeAll(async () => {
    await setupInMemoryMongo();
  });

  afterAll(async () => {
    await teardownInMemoryMongo();
  });

  it('creates permission and prevents duplicates', async () => {
    const p1 = await request(app).post('/api/permissions').send({ module: 'users', action: 'create' });
    expect(p1.status).toBe(201);
    const p2 = await request(app).post('/api/permissions').send({ module: 'users', action: 'create' });
    expect(p2.status).toBe(409);
  });

  it('creates a visit and lists with populated user/services', async () => {
    const u = await request(app).post('/api/users').send({ name: 'V', email: 'v@test.com', password: 'secret123' });
    expect(u.status).toBe(201);

    const users = await request(app).get('/api/users');
    const userId = users.body.users ? users.body.users[0]._id : users.body[0]._id;

    const visit = await request(app).post('/api/visits').send({
      user: userId,
      visitDate: new Date().toISOString(),
      address: 'Calle 123',
      status: 'scheduled',
      services: [],
    });
    expect(visit.status).toBe(201);

    const list = await request(app).get('/api/visits');
    expect(list.status).toBe(200);
    expect(list.body.ok).toBe(true);
    expect(Array.isArray(list.body.visits)).toBe(true);
  });
});


