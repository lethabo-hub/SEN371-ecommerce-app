# Milestone 5 — Deployment Guide

## Overview

| Component | Platform | Reason |
|-----------|----------|--------|
| Frontend (React build) | **GitHub Pages** | Free static hosting, matches assignment brief, deployable via GitHub Actions |
| Backend (Express API) | **Render** (or Railway) | Free-tier Node hosting with GitHub auto-deploy |
| Database | **MongoDB Atlas** | Free-tier cloud MongoDB cluster |
| CI/CD | **GitHub Actions** | `.github/workflows/ci.yml` and `deploy-frontend.yml` (in this folder) |

> **Note:** Copy the `.github/workflows/` folder from this Milestone into the **root** of your actual
> Git repository (GitHub Actions only reads workflows from `<repo-root>/.github/workflows/`). It is kept
> here for organisation within the milestone submission structure.

---

## 0. Fastest option — Run everything locally with Docker

If you have Docker Desktop installed, you can run the database, backend, and frontend together with
one command — no manual MongoDB/Node setup required. From the root of the project:

```bash
docker compose -f Milestone5_Deployment/docker-compose.yml up --build
```

This starts:
- **MongoDB** on `localhost:27017`
- **Backend API** on `http://localhost:5000`
- **Frontend** on `http://localhost:5173`

Once it's up, seed sample data by running (in a new terminal):
```bash
docker exec -it shopwave-backend node seed.js
```

Stop everything with `docker compose -f Milestone5_Deployment/docker-compose.yml down` (add `-v` to also
wipe the database volume).

This is ideal for local demoing/marking — the sections below cover the **public, live** deployment
required by the brief (GitHub Pages + Render + Atlas).

---

## 1. Database — MongoDB Atlas

1. Create a free cluster at https://www.mongodb.com/cloud/atlas.
2. Create a database user (username/password) and whitelist your IP (or `0.0.0.0/0` for the class demo).
3. Copy the connection string, e.g.
   `mongodb+srv://<user>:<password>@cluster0.mongodb.net/shopwave`.

## 2. Backend — Render

1. Push the `Milestone2_BackendDevelopment/backend` folder to a GitHub repository (root of repo, or as
   a subfolder — Render lets you set a "Root Directory").
2. On https://render.com, create a **New Web Service** connected to that repo.
   - Root Directory: `backend` (or wherever it sits in your repo)
   - Build Command: `npm install`
   - Start Command: `npm start`
3. Add environment variables in the Render dashboard:
   - `MONGO_URI` = your Atlas connection string
   - `JWT_SECRET` = a long random string
   - `JWT_EXPIRES_IN` = `7d`
   - `NODE_ENV` = `production`
4. Deploy. Render gives you a live URL, e.g. `https://shopwave-api.onrender.com`.
5. (Optional) Run `node seed.js` locally against the Atlas URI once, to seed an admin user and sample products.

## 3. Frontend — GitHub Pages

1. In `Milestone4_FrontendDevelopment/frontend/vite.config.js`, set `base: '/<your-repo-name>/'`.
2. Set the `VITE_API_BASE_URL` environment variable / GitHub secret to your live Render backend URL
   (e.g. `https://shopwave-api.onrender.com/api/v1`).
3. Push to `main`. The `deploy-frontend.yml` workflow will:
   - Install dependencies
   - Run `npm run build`
   - Publish the `dist/` folder to the `gh-pages` branch
4. In your repo's **Settings → Pages**, set the source to the `gh-pages` branch.
5. Your site will be live at `https://<username>.github.io/<repo-name>/`.

## 4. Continuous Integration

`ci.yml` runs the full backend automated test suite (Milestone 5 Testing) on every push and pull
request targeting `main`, so broken code cannot be merged. Configure **branch protection rules** on
`main` in GitHub Settings to require this check to pass before merging (Version Control requirement).

## 5. Post-Deployment Smoke Test Checklist

- [ ] Visit the GitHub Pages URL — the product catalogue loads.
- [ ] Register a new account.
- [ ] Log in.
- [ ] Add a product to the cart.
- [ ] Complete checkout with a shipping address.
- [ ] View the order under "My Orders".
- [ ] (Admin) Log in as the seeded admin and create/update a product.

This confirms **Live System Availability**, completing the Milestone 5 — Deployment deliverable.
