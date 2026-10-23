import test from 'node:test';
import assert from 'node:assert/strict';

function responseRecorder() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
    end() { return this; },
  };
}

test('payment creation fails closed when YooKassa credentials are absent', async () => {
  delete process.env.YOOKASSA_SHOP_ID;
  delete process.env.YOOKASSA_SECRET_KEY;
  const { default: handler } = await import('../api/create-payment.js?test=missing-credentials');
  const res = responseRecorder();
  await handler({ method: 'POST', headers: {}, body: { amount: 3390 } }, res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.body?.error, 'Платёж временно недоступен. Свяжитесь с поддержкой.');
});

test('payment creation rejects client-selected test amount', async () => {
  process.env.YOOKASSA_SHOP_ID = 'test-shop';
  process.env.YOOKASSA_SECRET_KEY = 'test-secret';
  process.env.FIREBASE_SERVICE_ACCOUNT_JSON = '{"client_email":"test@example.com","private_key":"test"}';
  process.env.FIREBASE_WEB_API_KEY = 'test-api-key';
  const { default: handler } = await import('../api/create-payment.js?test=reject-test-amount');
  const res = responseRecorder();
  await handler({ method: 'POST', headers: {}, body: { amount: 10 } }, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body?.error || '', /Стоимость заказа/);
});

test('payment creation rejects a client-selected discounted amount until server-side discount validation exists', async () => {
  process.env.YOOKASSA_SHOP_ID = 'test-shop';
  process.env.YOOKASSA_SECRET_KEY = 'test-secret';
  process.env.FIREBASE_SERVICE_ACCOUNT_JSON = '{"client_email":"test@example.com","private_key":"test"}';
  process.env.FIREBASE_WEB_API_KEY = 'test-api-key';
  const { default: handler } = await import('../api/create-payment.js?test=reject-discount');
  const res = responseRecorder();
  await handler({ method: 'POST', headers: {}, body: { amount: 3050 } }, res);
  assert.equal(res.statusCode, 400);
});

test('payment status endpoint rejects requests without a Firebase ID token', async () => {
  const { default: handler } = await import('../api/payment-status.js?test=unauthenticated');
  const res = responseRecorder();
  await handler({ method: 'GET', headers: {}, query: { orderId: '123e4567-e89b-12d3-a456-426614174000' } }, res);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body?.error, 'Authentication required');
});
