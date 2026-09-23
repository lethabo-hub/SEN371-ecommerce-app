const request = require('supertest');
const mongoose = require('mongoose');
const createApp = require('../src/app');
const Product = require('../src/models/Product');
const db = require('./setup/db');
const { asAdmin, asCustomer, createProduct, bearer } = require('./setup/factories');

const app = createApp();

beforeAll(async () => {
  await db.connect();
  // Product has a text index on name/description. Wait for it to be built
  // before any ?keyword= search runs, otherwise MongoDB rejects the $text query.
  await Product.init();
});

afterEach(async () => {
  await db.clear();
});

afterAll(async () => {
  await db.close();
});

describe('GET /api/v1/products', () => {
  it('returns an empty list with pagination metadata when there are no products', async () => {
    const res = await request(app).get('/api/v1/products');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.total).toBe(0);
    expect(res.body.page).toBe(1);
  });

  it('returns every product with a correct total', async () => {
    await createProduct({ name: 'Item One' });
    await createProduct({ name: 'Item Two' });

    const res = await request(app).get('/api/v1/products');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.total).toBe(2);
  });

  it('filters by category', async () => {
    await createProduct({ name: 'Tent', category: 'Camping' });
    await createProduct({ name: 'Mug', category: 'Kitchen' });

    const res = await request(app).get('/api/v1/products').query({ category: 'Camping' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].category).toBe('Camping');
  });

  it('paginates results using limit and page', async () => {
    await createProduct({ name: 'A' });
    await createProduct({ name: 'B' });
    await createProduct({ name: 'C' });

    const res = await request(app).get('/api/v1/products').query({ limit: 2, page: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.page).toBe(2);
    expect(res.body.pages).toBe(2);
    expect(res.body.total).toBe(3);
  });

  it('finds products by keyword search', async () => {
    await createProduct({ name: 'Waterproof Hiking Boots', description: 'Keeps your feet dry on wet trails.' });
    await createProduct({ name: 'Ceramic Coffee Mug', description: 'Holds three hundred millilitres.' });

    const res = await request(app).get('/api/v1/products').query({ keyword: 'hiking' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toMatch(/Hiking/);
  });
});

describe('GET /api/v1/products/:id', () => {
  it('returns a single product', async () => {
    const product = await createProduct({ name: 'Single Product' });

    const res = await request(app).get(`/api/v1/products/${product._id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Single Product');
  });

  it('returns 404 for a valid id that does not exist', async () => {
    const missingId = new mongoose.Types.ObjectId();

    const res = await request(app).get(`/api/v1/products/${missingId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 404 for a malformed id instead of leaking a cast error', async () => {
    const res = await request(app).get('/api/v1/products/not-a-valid-object-id');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Resource not found');
  });
});

describe('POST /api/v1/products (admin only)', () => {
  it('lets an admin create a product', async () => {
    const { token } = await asAdmin();

    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', bearer(token))
      .send({
        name: 'Merino Wool Socks',
        description: 'Breathable merino socks for multi day hikes.',
        price: 249.5,
        category: 'Apparel',
        stock: 40,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Merino Wool Socks');
    expect(res.body.data.stock).toBe(40);
  });

  it('blocks a normal customer with 403', async () => {
    const { token } = await asCustomer();

    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', bearer(token))
      .send({
        name: 'Sneaky Product',
        description: 'This should never be created by a customer.',
        price: 100,
        category: 'Misc',
      });

    expect(res.status).toBe(403);
  });

  it('blocks an unauthenticated request with 401', async () => {
    const res = await request(app).post('/api/v1/products').send({
      name: 'Anonymous Product',
      description: 'This should never be created without a token.',
      price: 100,
      category: 'Misc',
    });

    expect(res.status).toBe(401);
  });

  it('rejects a non-positive price with 400', async () => {
    const { token } = await asAdmin();

    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', bearer(token))
      .send({
        name: 'Free Lunch',
        description: 'A product with an invalid negative price value.',
        price: -10,
        category: 'Misc',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/price/i);
  });
});

describe('PUT / DELETE /api/v1/products/:id (admin only)', () => {
  it('lets an admin update a product', async () => {
    const { token } = await asAdmin();
    const product = await createProduct({ price: 500 });

    const res = await request(app)
      .put(`/api/v1/products/${product._id}`)
      .set('Authorization', bearer(token))
      .send({ price: 450 });

    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(450);
  });

  it('lets an admin delete a product', async () => {
    const { token } = await asAdmin();
    const product = await createProduct();

    const res = await request(app)
      .delete(`/api/v1/products/${product._id}`)
      .set('Authorization', bearer(token));

    expect(res.status).toBe(200);
    expect(await Product.findById(product._id)).toBeNull();
  });
});
