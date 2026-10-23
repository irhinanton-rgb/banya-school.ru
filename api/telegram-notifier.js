import https from 'https';

// Credentials must be configured in the server environment. Never commit bot tokens.
export const TELEGRAM_BOT_TOKEN = process.env.PARMASTER_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '';

export const ADMIN_CHAT_IDS = Array.from(
  new Set(
    [process.env.TELEGRAM_ADMIN_CHAT_ID]
      .filter(Boolean)
      .map(id => String(id).trim())
  )
);

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function sendTelegramToChat(chatId, text, extra = {}) {
  if (!TELEGRAM_BOT_TOKEN || !chatId) {
    return { ok: false, error: 'Telegram bot token or chat ID is not configured' };
  }
  const payload = JSON.stringify({
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...extra,
  });

  return new Promise((resolve) => {
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
}

export async function broadcastToAdmins(text, extra = {}) {
  if (!TELEGRAM_BOT_TOKEN || ADMIN_CHAT_IDS.length === 0) {
    return [{ ok: false, error: 'Telegram bot token or admin chat ID is not configured' }];
  }
  const results = await Promise.allSettled(
    ADMIN_CHAT_IDS.map((chatId) => sendTelegramToChat(chatId, text, extra))
  );
  return results.map((r) => (r.status === 'fulfilled' ? r.value : { ok: false, error: r.reason }));
}
