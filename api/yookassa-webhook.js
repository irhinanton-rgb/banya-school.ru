export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    console.log('[YooKassa Webhook Event]:', body?.event, body?.object?.id);

    if (body?.event === 'payment.succeeded') {
      const payment = body.object;
      const amount = payment?.amount?.value;
      const metadata = payment?.metadata || {};
      console.log(`[Payment Succeeded]: id=${payment?.id}, amount=${amount}, userId=${metadata?.userId}, email=${metadata?.userEmail}`);
      // Respond with 200 OK as strictly required by YooKassa Webhook protocol
      return res.status(200).json({ status: 'ok' });
    }

    if (body?.event === 'payment.canceled') {
      console.log('[Payment Canceled]: id=', body?.object?.id);
      return res.status(200).json({ status: 'ok' });
    }

    return res.status(200).json({ status: 'received' });
  } catch (error) {
    console.error('[YooKassa Webhook Error]:', error);
    return res.status(200).json({ status: 'error_handled' });
  }
}
