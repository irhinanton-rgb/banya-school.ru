import crypto from 'crypto';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'banya-school';
const SERVICE_ACCOUNT_JSON = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

let cachedAccessToken = '';
let cachedAccessTokenExpiresAt = 0;

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function parseServiceAccount() {
  if (!SERVICE_ACCOUNT_JSON) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not configured');
  const account = JSON.parse(SERVICE_ACCOUNT_JSON);
  if (!account.client_email || !account.private_key) throw new Error('Invalid Firebase service account credentials');
  return account;
}

async function getAccessToken() {
  if (cachedAccessToken && Date.now() < cachedAccessTokenExpiresAt - 60_000) return cachedAccessToken;
  const account = parseServiceAccount();
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(JSON.stringify({
    iss: account.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: account.token_uri || 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = header + '.' + claim;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const assertion = unsigned + '.' + signer.sign(account.private_key, 'base64url');
  const response = await fetch(account.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error('Could not obtain Firestore access token');
  cachedAccessToken = data.access_token;
  cachedAccessTokenExpiresAt = Date.now() + Number(data.expires_in || 3600) * 1000;
  return cachedAccessToken;
}

function encodeValue(value) {
  if (value === null) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value)
    ? { integerValue: String(value) }
    : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeValue) } };
  if (typeof value === 'object') {
    return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, encodeValue(v)])) } };
  }
  return { stringValue: String(value) };
}

function decodeValue(value = {}) {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeValue);
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([k, v]) => [k, decodeValue(v)]));
  return undefined;
}

function decodeDocument(document) {
  return Object.fromEntries(Object.entries(document?.fields || {}).map(([k, v]) => [k, decodeValue(v)]));
}

function documentsUrl(path = '') {
  return `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents${path}`;
}

async function firestoreRequest(path, options = {}) {
  const token = await getAccessToken();
  const response = await fetch(documentsUrl(path), {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Firestore request failed (${response.status})`);
  }
  return body;
}

export async function getOrder(orderId) {
  const document = await firestoreRequest(`/payment_orders/${encodeURIComponent(orderId)}`);
  return document ? decodeDocument(document) : null;
}

export async function createOrder(orderId, data) {
  const fields = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, encodeValue(v)]));
  return firestoreRequest(`/payment_orders?documentId=${encodeURIComponent(orderId)}`, {
    method: 'POST',
    body: JSON.stringify({ fields }),
  });
}

export async function updateOrder(orderId, data) {
  const fields = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, encodeValue(v)]));
  const masks = Object.keys(data).map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
  return firestoreRequest(`/payment_orders/${encodeURIComponent(orderId)}?${masks}`, {
    method: 'PATCH',
    body: JSON.stringify({ fields }),
  });
}

export async function grantPaidEntitlement(uid, orderId, paidAt) {
  if (!uid || !/^[A-Za-z0-9_-]{1,128}$/.test(uid)) throw new Error('Invalid Firebase UID');
  const existing = await firestoreRequest(`/users/${encodeURIComponent(uid)}/progress/current`);
  const old = decodeDocument(existing);
  const fields = {
    userId: encodeValue(uid),
    name: encodeValue(typeof old.name === 'string' && old.name ? old.name : 'Ученик курса'),
    xp: encodeValue(typeof old.xp === 'number' ? old.xp : 0),
    completedLevels: encodeValue(Array.isArray(old.completedLevels) ? old.completedLevels : []),
    unlockedBadges: encodeValue(Array.isArray(old.unlockedBadges) ? old.unlockedBadges : []),
    activeLevelId: encodeValue(typeof old.activeLevelId === 'number' ? old.activeLevelId : 1),
    examScore: encodeValue(typeof old.examScore === 'number' ? old.examScore : 0),
    certifiedDate: encodeValue(typeof old.certifiedDate === 'string' ? old.certifiedDate : ''),
    tariff: encodeValue('master_pro'),
    isPaid: encodeValue(true),
    paidAt: encodeValue(paidAt),
    orderId: encodeValue(orderId),
    bio: encodeValue(typeof old.bio === 'string' ? old.bio : ''),
    banyaStatus: encodeValue(typeof old.banyaStatus === 'string' ? old.banyaStatus : ''),
    city: encodeValue(typeof old.city === 'string' ? old.city : ''),
    favoriteBrooms: encodeValue(Array.isArray(old.favoriteBrooms) ? old.favoriteBrooms : []),
    updatedAt: encodeValue(paidAt),
  };
  await firestoreRequest(`/users/${encodeURIComponent(uid)}/progress/current`, {
    method: 'PATCH',
    body: JSON.stringify({ fields }),
  });
  return true;
}

export async function verifyFirebaseIdToken(idToken, apiKey) {
  if (!idToken || !apiKey) return null;
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const data = await response.json().catch(() => ({}));
  const user = data?.users?.[0];
  if (!response.ok || !user?.localId) return null;
  return { uid: user.localId, email: String(user.email || '').toLowerCase() };
}
