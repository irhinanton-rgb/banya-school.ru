import https from 'https';

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8683515876:AAHzMeka0nuQG0Hc1lTJCNuPZRogpg-Lw_0';

// Anton Irkhin's Telegram Chat ID and channels
export const ADMIN_CHAT_IDS = [
  '471147423', // Антон Ирхин (@Anton_Irkhin)
  process.env.TELEGRAM_ADMIN_CHAT_ID,
  process.env.TELEGRAM_CHAT_ID || '@BatyaVBane',
].filter(Boolean);

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Send a message to a specific Telegram chat
 */
export async function sendTelegramToChat(chatId, text, extra = {}) {
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

/**
 * Broadcast message to all registered admins / channels
 */
export async function broadcastToAdmins(text, extra = {}) {
  const recipients = Array.from(new Set(ADMIN_CHAT_IDS));
  const results = await Promise.allSettled(
    recipients.map((chatId) => sendTelegramToChat(chatId, text, extra))
  );
  return results.map((r) => (r.status === 'fulfilled' ? r.value : { ok: false, error: r.reason }));
}
