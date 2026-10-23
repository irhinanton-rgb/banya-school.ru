import https from 'https';
import crypto from 'crypto';
import { createOrder, updateOrder, verifyFirebaseIdToken } from '../server/firebase-admin-rest.js';

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;

function getSafeReturnOrigin(rawOrigin) {
  if (!rawOrigin || typeof rawOrigin !== 'string') {
    return 'https://banya-school.ru';
  }
  try {
    const parsed = new URL(rawOrigin);
    const host = parsed.hostname.toLowerCase();
    const isAllowedHost =
      host === 'banya-school.ru' ||
      host === 'www.banya-school.ru' ||
      host === 'localhost' ||
      host === '127.0.0.1';

    if (isAllowedHost && (parsed.protocol === 'https:' || parsed.protocol === 'http:')) {
      return `${parsed.protocol}//${parsed.host}`;
    }
  } catch {
    // fallback to default
  }
  return 'https://banya-school.ru';
}

export default async function handler(req, res) {
  // Restrict browser access to the production site and local development.
  const requestOrigin = req.headers.origin;
  const allowedOrigins = new Set(['https://banya-school.ru', 'https://www.banya-school.ru', 'http://localhost:3000', 'http://127.0.0.1:3000']);
  if (requestOrigin && allowedOrigins.has(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') {
    if (requestOrigin && !allowedOrigins.has(requestOrigin)) return res.status(403).end();
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { amount, userEmail } = body;

    // Reject client-selected prices before any payment/order side effects.
    if (Number(amount) !== 3390) {
      return res.status(400).json({ error: 'Стоимость заказа изменилась. Обновите страницу и повторите попытку.' });
    }
    const validAmount = '3390.00';
    if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY || !process.env.FIREBASE_SERVICE_ACCOUNT_JSON || !process.env.FIREBASE_WEB_API_KEY) {
      console.error('Payment/Firebase server credentials are not configured.');
      return res.status(503).json({ error: 'Платёж временно недоступен. Свяжитесь с поддержкой.' });
    }

    const authorization = String(req.headers.authorization || '');
    const idToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    const firebaseUser = await verifyFirebaseIdToken(idToken, process.env.FIREBASE_WEB_API_KEY);
    if (!firebaseUser) {
      return res.status(401).json({ error: 'Войдите в аккаунт перед оплатой курса.' });
    }
    const paymentDesc = 'Курс Пармастера: Путь к Мастерству (Тариф Мастер PRO)';

    const idempotenceKey = crypto.randomUUID();
    const orderRecord = {
      orderId: idempotenceKey,
      userId: firebaseUser.uid,
      userEmail: firebaseUser.email,
      amount: validAmount,
      currency: 'RUB',
      tariff: 'master_pro',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    try {
      await createOrder(idempotenceKey, orderRecord);
    } catch (error) {
      console.error('Could not persist payment order:', error);
      return res.status(503).json({ error: 'Не удалось создать заказ. Попробуйте позже.' });
    }
    const authHeader = 'Basic ' + Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');

    const safeOrigin = getSafeReturnOrigin(req.headers.origin || req.headers.referer);
    const returnUrl = `${safeOrigin}/?payment=success&orderId=${encodeURIComponent(idempotenceKey)}&amount=${encodeURIComponent(validAmount)}`;

    const payload = JSON.stringify({
      amount: {
        value: validAmount,
        currency: 'RUB'
      },
      capture: true,
      confirmation: {
        type: 'redirect',
        return_url: returnUrl
      },
      description: paymentDesc,
      metadata: {
        userId: firebaseUser.uid,
        userEmail: firebaseUser.email || String(userEmail || '').slice(0, 150),
        orderId: idempotenceKey,
        isTest: false
      }
    });

    const yooResponse = await new Promise((resolve, reject) => {
      const request = https.request({
        hostname: 'api.yookassa.ru',
        path: '/v3/payments',
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Idempotence-Key': idempotenceKey,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (response) => {
        let data = '';
        response.on('data', chunk => { data += chunk; });
        response.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ statusCode: response.statusCode, data: parsed });
          } catch (err) {
            reject(new Error(`Failed to parse YooKassa response`));
          }
        });
      });

      request.on('error', reject);
      request.write(payload);
      request.end();
    });

    if (yooResponse.statusCode >= 200 && yooResponse.statusCode < 300) {
      const confirmationUrl = yooResponse.data?.confirmation?.confirmation_url;
      if (!confirmationUrl || !yooResponse.data?.id) {
        await updateOrder(idempotenceKey, { status: 'creation_failed', updatedAt: new Date().toISOString() });
        return res.status(502).json({ error: 'Платёжный шлюз не вернул ссылку для оплаты.' });
      }
      await updateOrder(idempotenceKey, {
        paymentId: String(yooResponse.data.id),
        status: String(yooResponse.data.status || 'pending'),
        updatedAt: new Date().toISOString(),
      });
      return res.status(200).json({
        success: true,
        paymentId: yooResponse.data?.id,
        status: yooResponse.data?.status,
        confirmationUrl,
        orderId: idempotenceKey,
        amount: validAmount
      });
    } else {
      console.error('YooKassa API Error:', yooResponse.statusCode);
      await updateOrder(idempotenceKey, { status: 'creation_failed', updatedAt: new Date().toISOString() }).catch(() => {});
      return res.status(yooResponse.statusCode || 500).json({
        error: yooResponse.data?.description || 'Failed to create payment in YooKassa'
      });
    }
  } catch (error) {
    console.error('Create payment handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
