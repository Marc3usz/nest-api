type HttpResult = {
  status: number;
  headers: Headers;
  body: unknown;
};

function getHostedBaseUrl(): string {
  const fromEnv = process.env.HOSTED_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  const fromArg = process.argv
    .find((arg) => arg.startsWith('--url=') || arg.startsWith('--baseUrl='))
    ?.split('=')[1]
    ?.trim();

  if (fromArg) {
    return fromArg.replace(/\/$/, '');
  }

  throw new Error(
    'Missing hosted API URL. Set HOSTED_API_URL or pass --url=https://your-deployment.vercel.app',
  );
}

async function requestJson(
  baseUrl: string,
  path: string,
  init?: RequestInit,
): Promise<HttpResult> {
  const response = await fetch(`${baseUrl}${path}`, init);
  const contentType = response.headers.get('content-type') ?? '';

  let body: unknown;
  if (contentType.includes('application/json')) {
    body = await response.json();
  } else {
    body = await response.text();
  }

  return {
    status: response.status,
    headers: response.headers,
    body,
  };
}

describe('Hosted API', () => {
  const baseUrl = getHostedBaseUrl();
  const adminKey = process.env.HOSTED_ADMIN_KEY ?? 'supersecret';

  it('GET /api/v1/ping returns Pong!', async () => {
    const result = await requestJson(baseUrl, '/api/v1/ping');

    expect(result.status).toBe(200);
    expect(result.body).toBe('Pong!');
  });

  it('create/list/delete product works on hosted API', async () => {
    const name = `Hosted Product ${Date.now()}`;

    const create = await requestJson(baseUrl, '/api/v1/products', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, price: 49.99 }),
    });

    expect(create.status).toBe(201);
    const createdProduct = create.body as { id: number; name: string; price: number };
    expect(createdProduct.name).toBe(name);
    expect(createdProduct.price).toBe(49.99);

    const list = await requestJson(baseUrl, '/api/v1/products');
    expect(list.status).toBe(200);
    const products = list.body as Array<{ id: number; name: string }>;
    expect(products.some((product) => product.id === createdProduct.id)).toBe(true);

    const deleteResult = await requestJson(baseUrl, `/api/v1/products/${createdProduct.id}`, {
      method: 'DELETE',
      headers: { 'x-admin-key': adminKey },
    });
    expect(deleteResult.status).toBe(200);

    const afterDelete = await requestJson(baseUrl, `/api/v1/products/${createdProduct.id}`);
    expect(afterDelete.status).toBe(404);
  });

  it('add and read cart by cart key works on hosted API', async () => {
    const name = `Hosted Cart Product ${Date.now()}`;
    const cartKey = `hosted-cart-${Date.now()}`;

    const create = await requestJson(baseUrl, '/api/v1/products', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, price: 59.99 }),
    });
    expect(create.status).toBe(201);
    const createdProduct = create.body as { id: number };

    const add = await requestJson(baseUrl, '/api/v1/cart/add', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-cart-id': cartKey,
      },
      body: JSON.stringify({ productId: createdProduct.id, quantity: 2 }),
    });

    expect(add.status).toBe(201);
    const addBody = add.body as {
      cartId: string;
      items: Array<{ productId: number; quantity: number }>;
    };
    expect(addBody.cartId).toBe(cartKey);
    expect(addBody.items).toEqual([
      {
        productId: createdProduct.id,
        quantity: 2,
      },
    ]);

    const cart = await requestJson(baseUrl, '/api/v1/cart', {
      headers: { 'x-cart-id': cartKey },
    });

    expect(cart.status).toBe(200);
    expect(cart.body).toEqual([
      {
        productId: createdProduct.id,
        quantity: 2,
      },
    ]);

    await requestJson(baseUrl, `/api/v1/products/${createdProduct.id}`, {
      method: 'DELETE',
      headers: { 'x-admin-key': adminKey },
    });
  });
});
