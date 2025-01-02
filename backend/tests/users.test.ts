import request from 'supertest';
import app from '../src/index'; // Express-App importieren

describe('User Routes', () => {
  it('should register a user', async () => {
    const res = await request(app).post('/api/users/register').send({
      email: 'test@example.com',
      password: 'password',
      role: 'user',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('uid');
  });

  it('should fail to access protected route without token', async () => {
    const res = await request(app).get('/api/users/profile');

    expect(res.statusCode).toBe(401);
  });
});
