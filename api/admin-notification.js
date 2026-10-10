import https from 'https';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7992502826:AAFaVxzLifwnqRGnV1q3OhUmx4Ykz2C5OBU';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID || '@BatyaVBane';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { type, message, userName, userEmail, referralSource, createdAt } = body;

    let icon = '📩';
    let typeLabel = 'Сообщение';
    if (type === 'question') {
      icon = '🦉';
      typeLabel = 'Вопрос по квесту помощнику PQ';
    } else if (type === 'bug') {
      icon = '🐞';
      typeLabel = 'Отчёт об ошибке / Баге';
    } else if (type === 'feedback') {
      icon = '⭐';
      typeLabel = 'Впечатления & Отзыв';
    }

    const textLines = [
      `${icon} <b>${typeLabel} (banya-school.ru)</b>`,
      '',
      `👤 <b>От кого:</b> ${escapeHtml(userName || 'Гость курса')}`,
      userEmail ? `📧 <b>Email / Контакт:</b> ${escapeHtml(userEmail)}` : null,
      referralSource ? `🔍 <b>Откуда узнали о нас:</b> ${escapeHtml(referralSource)}` : null,
      createdAt ? `🕒 <b>Время:</b> ${escapeHtml(createdAt)}` : null,
      '',
      `💬 <b>Текст обращения:</b>`,
      escapeHtml(message || ''),
    ].filter(Boolean).join('\n');

    const payload = JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: textLines,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });

    const tgRes = await new Promise((resolve) => {
      const request = https.request(
        {
          hostname: 'api.telegram.org',
          port: 443,
          path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
        },
        (resp) => {
          let data = '';
          resp.on('data', (c) => { data += c; });
          resp.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              resolve({ ok: false, error: e.message });
            }
          });
        }
      );
      request.on('error', (e) => resolve({ ok: false, error: e.message }));
      request.write(payload);
      request.end();
    });

    return res.status(200).json({ success: true, telegram: tgRes });
  } catch (err) {
    console.error('Error in /api/admin-notification:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
