import https from 'https';
import crypto from 'crypto';

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID || '1485718';
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY || 'live_pko1h4rfqyVG9Un0_S8qJAHmitTEhR6u2od3psGUd5s';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { amount, description, userId, userEmail } = body;

    // Price can be 10 (test payment requested by Anton) or 3390 (official course price)
    const validAmount = Number(amount) === 10 ? '10.00' : '3390.00';
    const paymentDesc = description || (Number(amount) === 10
      ? 'Тестовый платёж 10 ₽ (Курс Пармастера banya-school.ru)'
      : 'Курс Пармастера: Путь к Мастерству (Тариф Мастер PRO)');

    const idempotenceKey = crypto.randomUUID();
    const authHeader = 'Basic ' + Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');

    const origin = req.headers.origin || req.headers.referer || 'https://banya-school.ru';
    const cleanOrigin = origin.split('?')[0].replace(/\/+$/, '');
    const returnUrl = `${cleanOrigin}/?payment=success&orderId=${idempotenceKey}&amount=${validAmount}`;

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
        userId: userId || 'guest',
        userEmail: userEmail || 'guest@banya-school.ru',
        isTest: Number(amount) === 10
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
            reject(new Error(`Failed to parse YooKassa response: ${data}`));
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
        error: yooResponse.data?.description || 'Failed to create payment in YooKassa',
        details: yooResponse.data
      });
    }
  } catch (error) {
    console.error('Create payment handler error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
