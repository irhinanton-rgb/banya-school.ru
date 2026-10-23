import { getOrder, verifyFirebaseIdToken } from './_lib/firebase-admin-rest.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const authorization = String(req.headers.authorization || '');
  const idToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const firebaseUser = await verifyFirebaseIdToken(idToken, process.env.FIREBASE_WEB_API_KEY);
  if (!firebaseUser) return res.status(401).json({ error: 'Authentication required' });

  const orderId = typeof req.query?.orderId === 'string' ? req.query.orderId : '';
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return res.status(400).json({ error: 'Invalid order id' });

  try {
    const order = await getOrder(orderId);
    if (!order || order.userId !== firebaseUser.uid) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.status(200).json({
      orderId: order.orderId,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      paidAt: order.paidAt || null,
    });
  } catch (error) {
    console.error('[Payment status]: Unable to read order:', error);
    return res.status(503).json({ error: 'Payment status temporarily unavailable' });
  }
}
