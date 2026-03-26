# Techni Backend

Backend API for a small shop-like flow built with NestJS, Prisma, and PostgreSQL.

## Stack

- NestJS 11
- Prisma 6 + PostgreSQL
- Swagger (OpenAPI)
- Class-validator / class-transformer

## Features

- Product catalog:
  - list products
  - get product by id
  - create product
  - delete product (guarded by admin key)
- Cart handling scoped by cart key header:
  - add product to cart
  - read cart items
- Health-style endpoint:
  - ping endpoint

## Project Structure

```text
src/
  products/   # product endpoints + admin guard
  cart/       # cart endpoints + cart logic
  ping/       # simple ping endpoint
  prisma/     # Prisma service initialization
prisma/
  schema.prisma
  migrations/
```

## Requirements

- Node.js 20+
- Docker (for local PostgreSQL)
- npm

## Environment Variables

Create a .env file in the project root. Example:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=db
POSTGRES_PORT=1234
DATABASE_URL=postgresql://postgres:password@localhost:1234/db

# Optional
PORT=3000
ADMIN_KEY=supersecret
```

Notes:
- If ADMIN_KEY is not set, the default key is supersecret.
- API routes are served under /api/v1.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start PostgreSQL container:

```bash
docker compose up -d
```

3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Apply migrations:

```bash
npm run prisma:migrate -- --name init
```

5. Start development server:

```bash
npm run start:dev
```

API base URL: http://localhost:3000/api/v1

Swagger docs: http://localhost:3000/api/v1/docs

## NPM Scripts

```bash
npm run start        # start app
npm run start:dev    # start in watch mode
npm run start:prod   # run compiled app

npm run build        # compile TypeScript
npm run lint         # lint and auto-fix
npm run format       # prettier format

npm run test         # unit tests
npm run test:e2e     # e2e tests
npm run test:cov     # test coverage

npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

## Deploy To Vercel

This project is configured for Vercel serverless deployment.

### One-time setup

1. Import this repository in Vercel.
2. Framework preset: Other.
3. Root directory: project root.
4. Build command: npm run build.
5. Install command: npm install.

### Required environment variables in Vercel

- DATABASE_URL
- ADMIN_KEY (optional but recommended)

Example DATABASE_URL:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### Deploy

After setting env vars, trigger a deployment from the Vercel dashboard or push to your connected branch.

API base URL on Vercel:

```text
https://<your-project>.vercel.app/api/v1
```

Swagger docs on Vercel:

```text
https://<your-project>.vercel.app/api/v1/docs
```

## API Endpoints

All endpoints below are relative to /api/v1.

### General

- GET /
  - Returns: Hello World!
- GET /ping
  - Returns: Pong!

### Products

- GET /products
  - Returns all products sorted by id ascending
- GET /products/:id
  - Returns one product
  - 404 if product does not exist
- POST /products
  - Body:

```json
{
  "name": "Keylogger Keyboard",
  "price": 299.99
}
```

- DELETE /products/:id
  - Requires header: x-admin-key
  - 404 if product does not exist

### Cart

Cart is identified by x-cart-id header. If omitted or blank, cart id defaults to default.

- POST /cart/add
  - Optional header: x-cart-id
  - Body:

```json
{
  "productId": 1,
  "quantity": 2
}
```

  - 404 if product does not exist
- GET /cart
  - Optional header: x-cart-id
  - Returns array of:

```json
{
  "productId": 1,
  "quantity": 2
}
```

## Example cURL

```bash
# create product
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Keylogger Keyboard\",\"price\":299.99}"

# list products
curl http://localhost:3000/api/v1/products

# add to cart (custom cart id)
curl -X POST http://localhost:3000/api/v1/cart/add \
  -H "Content-Type: application/json" \
  -H "x-cart-id: marcel-cart" \
  -d "{\"productId\":1,\"quantity\":2}"

# read cart
curl http://localhost:3000/api/v1/cart -H "x-cart-id: marcel-cart"

# delete product (admin)
curl -X DELETE http://localhost:3000/api/v1/products/1 \
  -H "x-admin-key: supersecret"
```

## Prisma Notes

- Prisma schema is in prisma/schema.prisma.
- Prisma config and datasource URL are defined in prisma.config.ts.
- Prisma client uses @prisma/adapter-pg in runtime.

## License

UNLICENSED
