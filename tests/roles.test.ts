import request from 'supertest';
import { createApp } from '../src/app';
import { setupInMemoryMongo, teardownInMemoryMongo } from './setup-db';

describe('Roles CRUD', () => {
  const app = createApp();
  let roleId: string;

  beforeAll(async () => {
    await setupInMemoryMongo();
  });

  afterAll(async () => {
    await teardownInMemoryMongo();
  });

  it('creates a role', async () => {
    const res = await request(app)
      .post('/api/roles')
      .send({ name: 'Admin', description: 'Administrator', permissions: [] });
    expect(res.status).toBe(201);
    roleId = res.body._id;
  });

  it('lists roles with usersCount and permissions populated', async () => {
    const res = await request(app).get('/api/roles');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.roles)).toBe(true);
  });

  it('updates a role', async () => {
    const res = await request(app)
      .put(`/api/roles/${roleId}`)
      .send({ description: 'Super Admin' });
    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Super Admin');
  });

  it('deletes a role', async () => {
    const res = await request(app)
      .delete(`/api/roles/${roleId}`);
    expect(res.status).toBe(204);
  });
});


