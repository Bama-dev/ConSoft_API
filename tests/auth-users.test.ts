import request from 'supertest';
import { createApp } from '../src/app';
import { setupInMemoryMongo, teardownInMemoryMongo } from './setup-db';

describe('Auth & Users', () => {
  const app = createApp();

  beforeAll(async () => {
    await setupInMemoryMongo();
  });

  afterAll(async () => {
    await teardownInMemoryMongo();
  });

  it('registers a user and uses cookie auth for /me', async () => {
    const register = await request(app)
      .post('/api/users')
      .send({ name: 'Admin', email: 'admin@test.com', password: 'secret123' });
    expect(register.status).toBe(200);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'secret123' });
    expect(login.status).toBe(200);
    const cookies = login.headers['set-cookie'];
    expect(cookies).toBeDefined();

    const me = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookies);
    expect(me.status).toBe(200);
    expect(me.body.email).toBe('admin@test.com');
  });
});


