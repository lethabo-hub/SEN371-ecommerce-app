const request = require('supertest');
const jwt = require('jsonwebtoken');
const createApp = require('../src/app');
const User = require('../src/models/User');
const db = require('./setup/db');
const { createUser, tokenFor, bearer, uniqueEmail } = require('./setup/factories');

const app = createApp();

beforeAll(async () => {
  await db.connect();
});

afterEach(async () => {
  await db.clear();
});

afterAll(async () => {
  await db.close();
});

describe('Service endpoints', () => {
  it('reports that the API is running on the root route', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('exposes a health check', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('returns a JSON 404 for an unknown route', async () => {
    const res = await request(app).get('/api/v1/definitely-not-a-route');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/route not found/i);
  });
});

describe('Security headers', () => {
  it('sets the helmet content-type-options header', async () => {
    const res = await request(app).get('/health');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('hides the Express x-powered-by header', async () => {
    const res = await request(app).get('/health');

    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('advertises rate limiting on the API surface', async () => {
    const res = await request(app).get('/api/v1/products');

    expect(res.headers['ratelimit-limit']).toBeDefined();
  });
});

describe('NoSQL injection protection', () => {
  it('does not let a query operator in the email field bypass login', async () => {
    await createUser({ email: 'victim@shopwave.test', password: 'Password123' });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: { $ne: null }, password: 'Password123' });

    expect(res.status).not.toBe(200);
    expect(res.body.data).toBeUndefined();
  });

  it('does not let query operators in both fields bypass login', async () => {
    await createUser({ email: 'victim2@shopwave.test', password: 'Password123' });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: { $gt: '' }, password: { $gt: '' } });

    expect(res.status).not.toBe(200);
    expect(res.body.data).toBeUndefined();
  });
});

describe('Input validation', () => {
  it('rejects a registration with a one-character name', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'A', email: uniqueEmail('short'), password: 'Password123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/name/i);
  });

  it('rejects a registration with a blank name', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: '   ', email: uniqueEmail('blank'), password: 'Password123' });

    expect(res.status).toBe(400);
  });

  it('rejects a login with a missing password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'someone@shopwave.test' });

    expect(res.status).toBe(400);
  });
});

describe('JWT handling', () => {
  it('rejects a structurally invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/profile')
      .set('Authorization', bearer('this.is.not.a.jwt'));

    expect(res.status).toBe(401);
  });

  it('rejects an expired token', async () => {
    const user = await createUser();
    const expired = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '-10s',
    });

    const res = await request(app).get('/api/v1/auth/profile').set('Authorization', bearer(expired));

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  it('rejects a valid token whose user has since been deleted', async () => {
    const user = await createUser();
    const token = tokenFor(user);
    await User.findByIdAndDelete(user._id);

    const res = await request(app).get('/api/v1/auth/profile').set('Authorization', bearer(token));

    expect(res.status).toBe(401);
  });
});

describe('Newsletter subscription', () => {
  it('accepts a valid email address', async () => {
    const res = await request(app)
      .post('/api/v1/subscribe')
      .send({ email: 'subscriber@shopwave.test' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('rejects an invalid email address', async () => {
    const res = await request(app).post('/api/v1/subscribe').send({ email: 'nope' });

    expect(res.status).toBe(400);
  });

  it('handles a duplicate subscription gracefully', async () => {
    await request(app).post('/api/v1/subscribe').send({ email: 'twice@shopwave.test' });
    const res = await request(app).post('/api/v1/subscribe').send({ email: 'twice@shopwave.test' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
