import request from 'supertest';
import { createApp } from '../src/app';
import { setupInMemoryMongo, teardownInMemoryMongo } from './setup-db';

describe('Visits update/delete', () => {
  const app = createApp();
  let userId: string;
  let visitId: string;

  beforeAll(async () => {
    await setupInMemoryMongo();
  });

  afterAll(async () => {
    await teardownInMemoryMongo();
  });

  it('creates a user and a visit', async () => {
    const reg = await request(app).post('/api/users').send({ name: 'V2', email: 'v2@test.com', password: 'secret123' });
    expect(reg.status).toBe(201);
    const users = await request(app).get('/api/users');
    userId = users.body.users ? users.body.users[0]._id : users.body[0]._id;

    const visit = await request(app).post('/api/visits').send({
      user: userId,
      visitDate: new Date().toISOString(),
      address: 'Calle 456',
      status: 'scheduled',
      services: [],
    });
    expect(visit.status).toBe(201);
    visitId = visit.body._id;
  });

  it('updates and deletes a visit', async () => {
    const upd = await request(app).put(`/api/visits/${visitId}`).send({ status: 'done' });
    expect(upd.status).toBe(200);
    expect(upd.body.status).toBe('done');

    const del = await request(app).delete(`/api/visits/${visitId}`);
    expect(del.status).toBe(204);
  });
});


