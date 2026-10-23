import https from 'https';
import crypto from 'crypto';

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID || '1485718';
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY || 'live_pko1h4rfqyVG9Un0_S8qJAHmitTEhR6u2od3psGUd5s';

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
      host === '127.0.0.1' ||
      host.endsWith('.vercel.app') ||
      host.endsWith('.run.app');

    if (isAllowedHost && (parsed.protocol === 'https:' || parsed.protocol === 'http:')) {
      return `${parsed.protocol}//${parsed.host}`;
    }
  } catch {
    // fallback to default
  }
  return 'https://banya-school.ru';
}

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
    const { amount, description, userId, userEmail, orderId } = body;

    // Price can be 10 (test payment) or official/discounted course prices (2890, 3050, 3140, 3390)
    const roundedAmount = Math.round(Number(amount) || 3390);
    const allowedAmounts = [10, 2890, 3050, 3140, 3390];
    const finalNumericAmount = allowedAmounts.includes(roundedAmount) ? roundedAmount : 3390;
    const validAmount = `${finalNumericAmount}.00`;

    const paymentDesc = String(
      description || (finalNumericAmount === 10
        ? 'Тестовый платёж 10 ₽ (Курс Пармастера banya-school.ru)'
        : 'Курс Пармастера: Путь к Мастерству (Тариф Мастер PRO)')
    ).slice(0, 128);

    const idempotenceKey = crypto.randomUUID();
    const safeOrderId =
      typeof orderId === 'string' && /^[a-zA-Z0-9_-]{4,64}$/.test(orderId)
        ? orderId
        : idempotenceKey;
    const authHeader = 'Basic ' + Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');

    const safeOrigin = getSafeReturnOrigin(req.headers.origin || req.headers.referer);
    const returnUrl = `${safeOrigin}/?payment=success&orderId=${encodeURIComponent(safeOrderId)}&amount=${encodeURIComponent(validAmount)}`;

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
        orderId: safeOrderId,
        isTest: finalNumericAmount === 10
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
        orderId: safeOrderId,
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
