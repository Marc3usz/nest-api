import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';


type ProductRecord = {
  id: number;
  name: string;
  price: number;
};

type CartRecord = {
  id: number;
  key: string;
};

type CartItemRecord = {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
};

function createPrismaMock() {
  const products: ProductRecord[] = [];
  const carts: CartRecord[] = [];
  const cartItems: CartItemRecord[] = [];
  let productIdSeq = 1;
  let cartIdSeq = 1;
  let cartItemIdSeq = 1;

  return {
    product: {
      findMany: async () => [...products].sort((a, b) => a.id - b.id),
      findUnique: async ({ where: { id } }: { where: { id: number } }) =>
        products.find((product) => product.id === id) ?? null,
      create: async ({ data }: { data: { name: string; price: number } }) => {
        const product = {
          id: productIdSeq++,
          name: data.name,
          price: data.price,
        };
        products.push(product);
        return product;
      },
      deleteMany: async ({ where: { id } }: { where: { id: number } }) => {
        const index = products.findIndex((product) => product.id === id);
        if (index === -1) {
          return { count: 0 };
        }
        products.splice(index, 1);
        return { count: 1 };
      },
    },
    cart: {
      upsert: async ({
        where: { key },
      }: {
        where: { key: string };
        update: Record<string, never>;
        create: { key: string };
        select: { id: boolean; key: boolean };
      }) => {
        const existing = carts.find((cart) => cart.key === key);
        if (existing) {
          return { id: existing.id, key: existing.key };
        }

        const cart = { id: cartIdSeq++, key };
        carts.push(cart);
        return { id: cart.id, key: cart.key };
      },
    },
    cartItem: {
      upsert: async ({
        where: {
          cartId_productId: { cartId, productId },
        },
        update,
        create,
      }: {
        where: { cartId_productId: { cartId: number; productId: number } };
        update: { quantity: { increment: number } };
        create: { cartId: number; productId: number; quantity: number };
      }) => {
        const existing = cartItems.find(
          (item) => item.cartId === cartId && item.productId === productId,
        );

        if (existing) {
          existing.quantity += update.quantity.increment;
          return existing;
        }

        const item = {
          id: cartItemIdSeq++,
          cartId: create.cartId,
          productId: create.productId,
          quantity: create.quantity,
        };
        cartItems.push(item);
        return item;
      },
      findMany: async ({
        where: { cartId },
      }: {
        where: { cartId: number };
        orderBy: { productId: 'asc' };
        select: { productId: boolean; quantity: boolean };
      }) =>
        cartItems
          .filter((item) => item.cartId === cartId)
          .sort((a, b) => a.productId - b.productId)
          .map((item) => ({ productId: item.productId, quantity: item.quantity })),
    },
  };
}

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const prismaMock = createPrismaMock();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect('Hello World!');
  });

  it('creates and deletes a product', async () => {
    const testName = `E2E Product ${Date.now()}`;

    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/products')
      .send({ name: testName, price: 19.99 })
      .expect(201);

    expect(createResponse.body.name).toBe(testName);
    expect(createResponse.body.price).toBe(19.99);
    expect(typeof createResponse.body.id).toBe('number');

    const productId = createResponse.body.id as number;

    const listResponse = await request(app.getHttpServer())
      .get('/api/v1/products')
      .expect(200);

    expect(
      listResponse.body.some(
        (product: { id: number; name: string }) =>
          product.id === productId && product.name === testName,
      ),
    ).toBe(true);

    await request(app.getHttpServer())
      .delete(`/api/v1/products/${productId}`)
      .set('x-admin-key', process.env.ADMIN_KEY ?? 'supersecret')
      .expect(200)
      .expect({ message: 'Produkt usuniety' });

    await request(app.getHttpServer())
      .get(`/api/v1/products/${productId}`)
      .expect(404);
  });

  it('blocks product deletion without admin key', async () => {
    await request(app.getHttpServer()).delete('/api/v1/products/1').expect(403);
  });

  it('adds item to cart and returns cart content for a cart key', async () => {
    const testName = `E2E Cart Product ${Date.now()}`;
    const cartKey = `e2e-cart-${Date.now()}`;

    const productResponse = await request(app.getHttpServer())
      .post('/api/v1/products')
      .send({ name: testName, price: 29.99 })
      .expect(201);

    const productId = productResponse.body.id as number;

    const addResponse = await request(app.getHttpServer())
      .post('/api/v1/cart/add')
      .set('x-cart-id', cartKey)
      .send({ productId, quantity: 2 })
      .expect(201);

    expect(addResponse.body.message).toBe('Dodano do koszyka');
    expect(addResponse.body.cartId).toBe(cartKey);
    expect(addResponse.body.items).toEqual([
      {
        productId,
        quantity: 2,
      },
    ]);

    const cartResponse = await request(app.getHttpServer())
      .get('/api/v1/cart')
      .set('x-cart-id', cartKey)
      .expect(200);

    expect(cartResponse.body).toEqual([
      {
        productId,
        quantity: 2,
      },
    ]);
  });

  it('returns 404 when adding non-existent product to cart', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/cart/add')
      .set('x-cart-id', `e2e-cart-missing-${Date.now()}`)
      .send({ productId: 999999999, quantity: 1 })
      .expect(404);
  });
});
