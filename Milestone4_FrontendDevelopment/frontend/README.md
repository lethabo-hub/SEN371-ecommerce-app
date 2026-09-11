# ShopWave Frontend (Milestone 4 — Frontend Development)

React (Vite) single-page application with a custom design system, dark mode, and a fully interactive
shopping experience — responsive across mobile, tablet, and desktop.

## Structure
```
frontend/
├── index.html               # custom fonts, meta tags, favicon
├── vite.config.js            # BASE_PATH configurable for GitHub Pages vs Docker
├── Dockerfile
├── src/
│   ├── main.jsx / App.jsx
│   ├── api/api.js              # Axios instance, auto-attaches JWT
│   ├── context/                  # Auth, Cart, Wishlist, Theme (dark mode), Toast notifications
│   ├── components/                # Navbar, ProductCard, StarRating, Footer, PrivateRoute, skeleton loader
│   ├── pages/                      # Home, ProductDetail, Login, Register, Cart, Checkout,
│   │                                 Orders, Wishlist, NotFound
│   └── index.css                    # full design system: CSS variables, dark/light themes, animations
```

## Setup
```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_BASE_URL to your backend URL
npm run dev              # http://localhost:5173
```

## Build for production
```bash
npm run build   # outputs to dist/ (base path defaults to /shopwave/ for GitHub Pages)
BASE_PATH=/ npm run build   # for root-domain hosting (e.g. Docker/Render static hosting)
```

## Run with Docker
```bash
docker build -t shopwave-frontend --build-arg VITE_API_BASE_URL=http://localhost:5000/api/v1 --build-arg BASE_PATH=/ .
docker run -p 5173:80 shopwave-frontend
```

## Features implemented
- **Design system** — CSS custom properties, consistent spacing/radius/shadow scale, Sora + Inter type pairing
- **Dark mode** — toggle in the navbar, persisted to localStorage
- Hero banner, category filter chips, live search
- Product catalogue with skeleton loading states and empty-state illustrations
- Product detail page with **star ratings & customer reviews** (post/read)
- **Wishlist** — heart-toggle on every product card, dedicated wishlist page
- Cart (update quantity, remove item, running total) → Checkout (shipping form) → Order history with status pills
- **Toast notifications** for every user action (add to cart, wishlist, checkout, auth)
- Fully responsive: 4→2→1 column product grid, mobile hamburger navigation
- Custom animated 404 page, protected routes, loading spinners
