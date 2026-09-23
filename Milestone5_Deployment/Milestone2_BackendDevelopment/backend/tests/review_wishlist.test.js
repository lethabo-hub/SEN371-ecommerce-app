const request = require('supertest');
const mongoose = require('mongoose');
const createApp = require('../src/app');
const Product = require('../src/models/Product');
const db = require('./setup/db');
const { asCustomer, asAdmin, createProduct, bearer } = require('./setup/factories');

const app = createApp();

const postReview = (token, productId, body) =>
  request(app)
    .post(`/api/v1/products/${productId}/reviews`)
    .set('Authorization', bearer(token))
    .send(body);

beforeAll(async () => {
  await db.connect();
});

afterEach(async () => {
  await db.clear();
});

afterAll(async () => {
  await db.close();
});

describe('Product reviews', () => {
  it('creates a review and updates the product average rating', async () => {
    const { token } = await asCustomer();
    const product = await createProduct();

    const res = await postReview(token, product._id, { rating: 4, comment: 'Solid pack, held up well.' });

    expect(res.status).toBe(201);
    expect(res.body.data.rating).toBe(4);

    const refreshed = await Product.findById(product._id);
    expect(refreshed.numReviews).toBe(1);
    expect(refreshed.averageRating).toBe(4);
  });

  it('averages multiple reviews from different users', async () => {
    const first = await asCustomer();
    const second = await asCustomer();
    const product = await createProduct();

    await postReview(first.token, product._id, { rating: 5, comment: 'Excellent quality.' });
    await postReview(second.token, product._id, { rating: 2, comment: 'Zip broke quickly.' });

    const refreshed = await Product.findById(product._id);
    expect(refreshed.numReviews).toBe(2);
    expect(refreshed.averageRating).toBe(3.5);
  });

  it('stops the same user reviewing a product twice', async () => {
    const { token } = await asCustomer();
    const product = await createProduct();

    await postReview(token, product._id, { rating: 5, comment: 'First review here.' });
    const res = await postReview(token, product._id, { rating: 1, comment: 'Second review attempt.' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already reviewed/i);
  });

  it('rejects a rating outside 1 to 5', async () => {
    const { token } = await asCustomer();
    const product = await createProduct();

    const res = await postReview(token, product._id, { rating: 9, comment: 'Out of range rating.' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/rating/i);
  });

  it('rejects a comment that is too short', async () => {
    const { token } = await asCustomer();
    const product = await createProduct();

    const res = await postReview(token, product._id, { rating: 3, comment: 'ok' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/comment/i);
  });

  it('returns 404 when reviewing a product that does not exist', async () => {
    const { token } = await asCustomer();
    const missingId = new mongoose.Types.ObjectId();

    const res = await postReview(token, missingId, { rating: 3, comment: 'Reviewing a ghost product.' });

    expect(res.status).toBe(404);
  });

  it('requires authentication to post a review', async () => {
    const product = await createProduct();

    const res = await request(app)
      .post(`/api/v1/products/${product._id}/reviews`)
      .send({ rating: 3, comment: 'Anonymous review attempt.' });

    expect(res.status).toBe(401);
  });

  it('lists the reviews for a product', async () => {
    const { token } = await asCustomer();
    const product = await createProduct();
    await postReview(token, product._id, { rating: 4, comment: 'Listing test review.' });

    const res = await request(app).get(`/api/v1/products/${product._id}/reviews`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].comment).toBe('Listing test review.');
  });

  it('lets a user delete their own review and recalculates the rating', async () => {
    const { token } = await asCustomer();
    const product = await createProduct();
    const created = await postReview(token, product._id, { rating: 5, comment: 'About to be deleted.' });

    const res = await request(app)
      .delete(`/api/v1/products/${product._id}/reviews/${created.body.data._id}`)
      .set('Authorization', bearer(token));

    expect(res.status).toBe(200);

    const refreshed = await Product.findById(product._id);
    expect(refreshed.numReviews).toBe(0);
    expect(refreshed.averageRating).toBe(0);
  });

  it('stops a user deleting someone else\'s review', async () => {
    const owner = await asCustomer();
    const stranger = await asCustomer();
    const product = await createProduct();
    const created = await postReview(owner.token, product._id, { rating: 5, comment: 'Not yours to delete.' });

    const res = await request(app)
      .delete(`/api/v1/products/${product._id}/reviews/${created.body.data._id}`)
      .set('Authorization', bearer(stranger.token));

    expect(res.status).toBe(403);
  });

  it('lets an admin delete any review', async () => {
    const owner = await asCustomer();
    const admin = await asAdmin();
    const product = await createProduct();
    const created = await postReview(owner.token, product._id, { rating: 5, comment: 'Admin will remove this.' });

    const res = await request(app)
      .delete(`/api/v1/products/${product._id}/reviews/${created.body.data._id}`)
      .set('Authorization', bearer(admin.token));

    expect(res.status).toBe(200);
  });
});

describe('Wishlist', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/v1/wishlist');
    expect(res.status).toBe(401);
  });

  it('starts empty', async () => {
    const { token } = await asCustomer();

    const res = await request(app).get('/api/v1/wishlist').set('Authorization', bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('adds a product to the wishlist', async () => {
    const { token } = await asCustomer();
    const product = await createProduct({ name: 'Wishlisted Item' });

    const res = await request(app)
      .post(`/api/v1/wishlist/${product._id}`)
      .set('Authorization', bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Wishlisted Item');
  });

  it('does not add the same product twice', async () => {
    const { token } = await asCustomer();
    const product = await createProduct();

    await request(app).post(`/api/v1/wishlist/${product._id}`).set('Authorization', bearer(token));
    const res = await request(app)
      .post(`/api/v1/wishlist/${product._id}`)
      .set('Authorization', bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('returns 404 when wishlisting a product that does not exist', async () => {
    const { token } = await asCustomer();
    const missingId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .post(`/api/v1/wishlist/${missingId}`)
      .set('Authorization', bearer(token));

    expect(res.status).toBe(404);
  });

  it('removes a product from the wishlist', async () => {
    const { token } = await asCustomer();
    const product = await createProduct();
    await request(app).post(`/api/v1/wishlist/${product._id}`).set('Authorization', bearer(token));

    const res = await request(app)
      .delete(`/api/v1/wishlist/${product._id}`)
      .set('Authorization', bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});
