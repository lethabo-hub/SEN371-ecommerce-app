const request = require('supertest');
const createApp = require('../src/app');
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

describe('POST /api/v1/auth/register', () => {
  it('registers a new user and returns a JWT', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Thandi Mokoena',
      email: 'thandi@shopwave.test',
      password: 'Password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('thandi@shopwave.test');
    expect(res.body.data.role).toBe('customer');
    expect(typeof res.body.data.token).toBe('string');
  });

  it('never returns the password hash in the response', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Thandi Mokoena',
      email: 'thandi2@shopwave.test',
      password: 'Password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.password).toBeUndefined();
  });

  it('rejects an email that is already registered', async () => {
    const existing = await createUser({ email: 'taken@shopwave.test' });

    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Someone Else',
      email: existing.email,
      password: 'Password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects a malformed email address', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Bad Email',
      email: 'not-an-email',
      password: 'Password123',
    });

    expect(res.status).toBe(400);
  });

  it('rejects a password with no number in it', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Weak Password',
      email: uniqueEmail('weak'),
      password: 'password',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/number/i);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('logs in with correct credentials and returns a JWT', async () => {
    const user = await createUser({ email: 'login@shopwave.test', password: 'Password123' });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'Password123' });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data._id).toBe(user._id.toString());
  });

  it('rejects a wrong password with 401', async () => {
    const user = await createUser({ email: 'wrongpass@shopwave.test', password: 'Password123' });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'TotallyWrong9' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects an email that does not exist with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ghost@shopwave.test', password: 'Password123' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/auth/profile', () => {
  it('returns the logged-in user for a valid token', async () => {
    const user = await createUser({ name: 'Profile User' });

    const res = await request(app)
      .get('/api/v1/auth/profile')
      .set('Authorization', bearer(tokenFor(user)));

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Profile User');
    expect(res.body.data.password).toBeUndefined();
  });

  it('returns 401 when no token is supplied', async () => {
    const res = await request(app).get('/api/v1/auth/profile');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 401 for a token signed with the wrong secret', async () => {
    const jwt = require('jsonwebtoken');
    const user = await createUser();
    const forged = jwt.sign({ id: user._id, role: user.role }, 'the_wrong_secret');

    const res = await request(app).get('/api/v1/auth/profile').set('Authorization', bearer(forged));

    expect(res.status).toBe(401);
  });
});
