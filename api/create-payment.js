import https from 'https';
import crypto from 'crypto';

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
    const { amount, description, userId, userEmail } = body;

    // The server owns pricing. Do not accept client-selected/test amounts.
    if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
      console.error('YooKassa credentials are not configured.');
      return res.status(503).json({ error: 'Платёж временно недоступен. Свяжитесь с поддержкой.' });
    }
    if (Number(amount) !== 3390) {
      return res.status(400).json({ error: 'Стоимость заказа изменилась. Обновите страницу и повторите попытку.' });
    }
    const validAmount = '3390.00';
    const paymentDesc = 'Курс Пармастера: Путь к Мастерству (Тариф Мастер PRO)';

    const idempotenceKey = crypto.randomUUID();
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
        userId: String(userId || 'guest').slice(0, 128),
        userEmail: String(userEmail || 'guest@banya-school.ru').slice(0, 150),
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
      return res.status(200).json({
        success: true,
        paymentId: yooResponse.data?.id,
        status: yooResponse.data?.status,
        confirmationUrl,
        orderId: idempotenceKey,
        amount: validAmount
      });
    } else {
      console.error('YooKassa API Error:', yooResponse.data);
      return res.status(yooResponse.statusCode || 500).json({
        error: yooResponse.data?.description || 'Failed to create payment in YooKassa'
      });
    }
  } catch (error) {
    console.error('Create payment handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
