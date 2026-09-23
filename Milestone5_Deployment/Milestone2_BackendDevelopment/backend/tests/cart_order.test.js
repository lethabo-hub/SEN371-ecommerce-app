const request = require('supertest');
const mongoose = require('mongoose');
const createApp = require('../src/app');
const Product = require('../src/models/Product');
const Cart = require('../src/models/Cart');
const db = require('./setup/db');
const { asCustomer, asAdmin, createProduct, bearer } = require('./setup/factories');

const app = createApp();

const VALID_ADDRESS = {
  street: '12 Long Street',
  city: 'Johannesburg',
  postalCode: '2001',
  country: 'South Africa',
};

beforeAll(async () => {
  await db.connect();
});

afterEach(async () => {
  await db.clear();
});

afterAll(async () => {
  await db.close();
});

describe('Cart endpoints', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/v1/cart');
    expect(res.status).toBe(401);
  });

  it('creates an empty cart on first access', async () => {
    const { token } = await asCustomer();

    const res = await request(app).get('/api/v1/cart').set('Authorization', bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.data.items).toEqual([]);
  });

  it('adds an item to the cart', async () => {
    const { token } = await asCustomer();
    const product = await createProduct({ stock: 10 });

    const res = await request(app)
      .post('/api/v1/cart')
      .set('Authorization', bearer(token))
      .send({ productId: product._id.toString(), quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].quantity).toBe(2);
  });

  it('increases the quantity instead of duplicating an existing item', async () => {
    const { token } = await asCustomer();
    const product = await createProduct({ stock: 10 });
    const payload = { productId: product._id.toString(), quantity: 2 };

    await request(app).post('/api/v1/cart').set('Authorization', bearer(token)).send(payload);
    const res = await request(app)
      .post('/api/v1/cart')
      .set('Authorization', bearer(token))
      .send({ ...payload, quantity: 3 });

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].quantity).toBe(5);
  });

  it('refuses to add more units than there are in stock', async () => {
    const { token } = await asCustomer();
    const product = await createProduct({ stock: 1 });

    const res = await request(app)
      .post('/api/v1/cart')
      .set('Authorization', bearer(token))
      .send({ productId: product._id.toString(), quantity: 5 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/stock/i);
  });

  it('returns 404 when adding a product that does not exist', async () => {
    const { token } = await asCustomer();
    const missingId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .post('/api/v1/cart')
      .set('Authorization', bearer(token))
      .send({ productId: missingId.toString(), quantity: 1 });

    expect(res.status).toBe(404);
  });

  it('updates the quantity of an item already in the cart', async () => {
    const { token } = await asCustomer();
    const product = await createProduct({ stock: 10 });
    await request(app)
      .post('/api/v1/cart')
      .set('Authorization', bearer(token))
      .send({ productId: product._id.toString(), quantity: 1 });

    const res = await request(app)
      .put(`/api/v1/cart/${product._id}`)
      .set('Authorization', bearer(token))
      .send({ quantity: 4 });

    expect(res.status).toBe(200);
    expect(res.body.data.items[0].quantity).toBe(4);
  });

  it('rejects a quantity below 1', async () => {
    const { token } = await asCustomer();
    const product = await createProduct({ stock: 10 });
    await request(app)
      .post('/api/v1/cart')
      .set('Authorization', bearer(token))
      .send({ productId: product._id.toString(), quantity: 1 });

    const res = await request(app)
      .put(`/api/v1/cart/${product._id}`)
      .set('Authorization', bearer(token))
      .send({ quantity: 0 });

    expect(res.status).toBe(400);
  });

  it('removes an item from the cart', async () => {
    const { token } = await asCustomer();
    const product = await createProduct({ stock: 10 });
    await request(app)
      .post('/api/v1/cart')
      .set('Authorization', bearer(token))
      .send({ productId: product._id.toString(), quantity: 1 });

    const res = await request(app)
      .delete(`/api/v1/cart/${product._id}`)
      .set('Authorization', bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.data.items).toEqual([]);
  });
});

describe('Order / checkout endpoints', () => {
  it('creates an order, decrements stock and empties the cart', async () => {
    const { user, token } = await asCustomer();
    const product = await createProduct({ price: 100, stock: 10 });

    await request(app)
      .post('/api/v1/cart')
      .set('Authorization', bearer(token))
      .send({ productId: product._id.toString(), quantity: 3 });

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', bearer(token))
      .send({ shippingAddress: VALID_ADDRESS });

    expect(res.status).toBe(201);
    expect(res.body.data.totalPrice).toBe(300);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.items).toHaveLength(1);

    const refreshedProduct = await Product.findById(product._id);
    expect(refreshedProduct.stock).toBe(7);

    const cart = await Cart.findOne({ user: user._id });
    expect(cart.items).toHaveLength(0);
  });

  it('refuses to check out an empty cart', async () => {
    const { token } = await asCustomer();

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', bearer(token))
      .send({ shippingAddress: VALID_ADDRESS });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/empty cart/i);
  });

  it('refuses to check out without a complete shipping address', async () => {
    const { token } = await asCustomer();
    const product = await createProduct({ stock: 5 });
    await request(app)
      .post('/api/v1/cart')
      .set('Authorization', bearer(token))
      .send({ productId: product._id.toString(), quantity: 1 });

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', bearer(token))
      .send({ shippingAddress: { street: '12 Long Street', city: 'Johannesburg' } });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/shipping address/i);
  });

  it('returns only the logged-in user\'s own orders', async () => {
    const productA = await createProduct({ price: 50, stock: 10 });
    const mine = await asCustomer();
    const theirs = await asCustomer();

    for (const who of [mine, theirs]) {
      await request(app)
        .post('/api/v1/cart')
        .set('Authorization', bearer(who.token))
        .send({ productId: productA._id.toString(), quantity: 1 });
      await request(app)
        .post('/api/v1/orders')
        .set('Authorization', bearer(who.token))
        .send({ shippingAddress: VALID_ADDRESS });
    }

    const res = await request(app)
      .get('/api/v1/orders/myorders')
      .set('Authorization', bearer(mine.token));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].user).toBe(mine.user._id.toString());
  });

  it('blocks a customer from listing all orders but allows an admin', async () => {
    const customer = await asCustomer();
    const admin = await asAdmin();

    const denied = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', bearer(customer.token));
    expect(denied.status).toBe(403);

    const allowed = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', bearer(admin.token));
    expect(allowed.status).toBe(200);
    expect(Array.isArray(allowed.body.data)).toBe(true);
  });

  it('lets an admin move an order to a new status', async () => {
    const customer = await asCustomer();
    const admin = await asAdmin();
    const product = await createProduct({ price: 100, stock: 5 });

    await request(app)
      .post('/api/v1/cart')
      .set('Authorization', bearer(customer.token))
      .send({ productId: product._id.toString(), quantity: 1 });
    const created = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', bearer(customer.token))
      .send({ shippingAddress: VALID_ADDRESS });

    const res = await request(app)
      .put(`/api/v1/orders/${created.body.data._id}/status`)
      .set('Authorization', bearer(admin.token))
      .send({ status: 'shipped' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('shipped');
  });

  it('rejects an unknown order status with 400', async () => {
    const admin = await asAdmin();
    const missingId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/v1/orders/${missingId}/status`)
      .set('Authorization', bearer(admin.token))
      .send({ status: 'teleported' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/status must be one of/i);
  });
});
