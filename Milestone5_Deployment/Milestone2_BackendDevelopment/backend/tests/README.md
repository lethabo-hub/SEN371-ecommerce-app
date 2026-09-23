# ShopWave — Backend Test Suite (Jest + Supertest)

Evidence for SEN371 Milestone 5: "Terminal output showing the Jest/Supertest suite passing."

## Where to run it

**Not** `Milestone5_Testing/backend_tests` — that folder does not exist in this repository.
The tests live next to the code they test, and the backend `package.json` already
declares Jest, Supertest and mongodb-memory-server as devDependencies.

```bash
cd Milestone2_BackendDevelopment/backend
npm install     # once per machine
npm test
```

## What you should see

```
PASS  tests/auth.test.js
PASS  tests/product.test.js
PASS  tests/cart_order.test.js
PASS  tests/review_wishlist.test.js
PASS  tests/validation_security.test.js

Test Suites: 5 passed, 5 total
Tests:       75 passed, 75 total
```

The `Test Suites` / `Tests` summary at the bottom is the part the marker needs.
Run `clear` (macOS/Linux) or `cls` (Windows CMD) first so the screenshot only
shows the test run.

## If the first run hangs

By default the suite starts an in-memory MongoDB, which downloads a small
binary the first time. That download can be blocked on restricted networks.
If it hangs or errors, point the tests at any real MongoDB instead:

```bash
# macOS / Linux
MONGO_URI_TEST=mongodb://127.0.0.1:27017/shopwave_test npm test

# Windows PowerShell
$env:MONGO_URI_TEST="mongodb://127.0.0.1:27017/shopwave_test"; npm test
```

You already have a MongoDB container available:

```bash
docker compose -f Milestone5_Deployment/docker-compose.yml up -d mongo
```

The suite drops its database when it finishes, so it never touches real data.

## What is covered

| File | Area |
|---|---|
| `auth.test.js` | Registration, login, JWT issuing, profile route protection |
| `product.test.js` | Product CRUD, keyword search, category filter, pagination, admin-only guards |
| `cart_order.test.js` | Cart add/update/remove, stock limits, checkout, stock decrement, order status |
| `review_wishlist.test.js` | Reviews, one-per-user rule, average rating recalculation, ownership rules, wishlist |
| `validation_security.test.js` | Helmet headers, NoSQL injection blocking, input validation, JWT expiry/tampering |

## Notes

- `tests/setup/env.js` sets `NODE_ENV=test` and a test `JWT_SECRET` before anything loads.
- Test users are created through the Mongoose model rather than `POST /auth/register`,
  because the auth routes are rate limited to 20 requests per IP per 15 minutes and
  repeated calls would return 429 instead of the status being asserted.
- Each test file gets a fresh database; documents are cleared between tests while
  indexes (and therefore unique constraints) are preserved.
