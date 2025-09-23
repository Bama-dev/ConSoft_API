import request from 'supertest';
import { createApp } from '../src/app';
import { setupInMemoryMongo, teardownInMemoryMongo } from './setup-db';

describe('User password update and login', () => {
  const app = createApp();
  let userId: string;

  beforeAll(async () => {
    await setupInMemoryMongo();
  });

  afterAll(async () => {
    await teardownInMemoryMongo();
  });

  it('registers a user', async () => {
    const res = await request(app).post('/api/users').send({ name: 'Pass', email: 'pass@test.com', password: 'oldpass1' });
    expect(res.status).toBe(201);
    const users = await request(app).get('/api/users');
    userId = users.body.users ? users.body.users[0]._id : users.body[0]._id;
  });

  it('updates password and can login with new password', async () => {
    const upd = await request(app).put(`/api/users/${userId}`).send({ password: 'newpass1' });
    expect(upd.status).toBe(200);

    const loginOld = await request(app).post('/api/auth/login').send({ email: 'pass@test.com', password: 'oldpass1' });
    expect(loginOld.status).toBe(400);

    const loginNew = await request(app).post('/api/auth/login').send({ email: 'pass@test.com', password: 'newpass1' });
    expect(loginNew.status).toBe(200);
    expect(loginNew.body.accessToken).toBeDefined();
  });
});


