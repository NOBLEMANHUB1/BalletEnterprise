# Ballet Enterprise — Backend

Node.js + Express + MongoDB API for the Ballet Enterprise storefront.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy the environment file and fill in real values:
   ```
   cp .env.example .env
   ```
   At minimum, set `MONGO_URI` (a local MongoDB instance or a free MongoDB Atlas cluster)
   and a random `JWT_SECRET`.

3. Seed the database with the starter product catalog and a default admin account:
   ```
   npm run seed
   ```

4. Start the server:
   ```
   npm run dev
   ```
   The API runs on `http://localhost:5000` by default (`GET /api/health` to check it's alive).

## Folder structure

```
src/
├── config/
│   └── db.js                 → MongoDB connection
├── models/
│   ├── Product.js
│   ├── Review.js
│   ├── Order.js
│   ├── User.js                → customer accounts
│   └── Admin.js
├── controllers/
│   ├── productController.js
│   ├── reviewController.js
│   ├── orderController.js
│   ├── authController.js       → customer signup/signin
│   └── adminAuthController.js
├── routes/
│   ├── productRoutes.js        → also mounts review endpoints
│   ├── orderRoutes.js
│   ├── authRoutes.js
│   └── adminRoutes.js
├── middleware/
│   ├── authMiddleware.js       → verifies customer JWT
│   ├── adminMiddleware.js      → verifies admin JWT
│   └── errorHandler.js
├── utils/
│   ├── generateToken.js
│   └── seed.js                 → npm run seed
├── app.js                       → Express app + route mounting
└── server.js                    → entry point
```

## API overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/products | Public | List products, filter with `?category=&availability=&search=` |
| GET | /api/products/:id | Public | Single product |
| POST | /api/products | Admin | Create product |
| PUT | /api/products/:id | Admin | Update product (e.g. price) |
| DELETE | /api/products/:id | Admin | Delete product |
| GET | /api/products/:id/reviews | Public | Reviews for a product |
| GET | /api/products/:id/reviews/summary | Public | Average rating + count |
| POST | /api/products/:id/reviews | Public | Submit a review |
| POST | /api/orders | Public/Customer | Place an order (guest or logged in) |
| GET | /api/orders/mine | Customer | Logged-in customer's order history |
| GET | /api/orders | Admin | All orders |
| PUT | /api/orders/:id/status | Admin | Update order status |
| POST | /api/auth/signup | Public | Create customer account |
| POST | /api/auth/signin | Public | Customer login |
| POST | /api/admin/login | Public | Admin login |

## Connecting the frontend

Once this is running, the frontend's `localStorage`-based logic (`store.js`, `cart.js`,
`orders.js`, `reviews.js`, `session.js`) will need to be swapped for `fetch()` calls to
these endpoints. That's the next step once you're ready.