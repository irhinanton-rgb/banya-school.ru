import fs from 'fs';
import path from 'path';
import https from 'https';

// BatyaVBane auto-publishing bot (@BatyaVBanyeBot) and channel (@BatyaVBane)
const TELEGRAM_BOT_TOKEN = process.env.BATYA_BOT_TOKEN || process.env.TELEGRAM_PUBLISH_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHANNEL_ID || process.env.TELEGRAM_CHAT_ID || '@BatyaVBane';

// VKontakte auto-publishing configuration
const VK_ACCESS_TOKEN = process.env.VK_ACCESS_TOKEN || '';
const VK_GROUP_ID = process.env.VK_GROUP_ID || ''; // Configure in server environment

// Anchor date to automatically cycle through the 30 days (Day 1 = 2026-10-15)
const START_DATE = process.env.TELEGRAM_CRON_START_DATE || '2026-10-15';

function formatToTelegramHtml(rawText, postMeta = {}) {
  let html = rawText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold: **text** -> <b>text</b>
  html = html.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');

  // Italic: *text* -> <i>text</i>
  html = html.replace(/\*([^*\n]+)\*/g, '<i>$1</i>');

  // Links: [label](url) -> <a href="url">label</a>
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2">$1</a>');

  const headerBadge = postMeta.rubric
    ? `<b>${postMeta.rubric}</b> • <i>День ${postMeta.day}/30</i>\n\n`
    : '';

  const takeawayBlock = postMeta.keyTakeaway
    ? `\n\n📌 <b>Главный вывод Бати:</b>\n<i>${postMeta.keyTakeaway}</i>`
    : '';

  return `${headerBadge}${html}${takeawayBlock}`;
}

/**
 * Formats post text into clean plain text with links for VKontakte wall.post
 */
function formatToVkText(rawText, postMeta = {}) {
  let text = rawText;

  // Convert [label](url) -> label (url) unless label already contains the domain
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, (match, label, url) => {
    if (label.includes('banya-school.ru')) {
      return url;
    }
    return `${label} (${url})`;
  });

  // Strip **bold** and *italic* markdown markers for clean VK reading
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*\n]+)\*/g, '$1');

  const header = postMeta.rubric
    ? `${postMeta.rubric} | День ${postMeta.day}/30\n\n`
    : '';

  const takeaway = postMeta.keyTakeaway
    ? `\n\n📌 Главный вывод Бати:\n${postMeta.keyTakeaway}`
    : '';

  return `${header}${text}${takeaway}`;
}

function sendTelegramPhoto(token, chatId, photoUrl, captionHtml) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      chat_id: chatId,
      photo: photoUrl,
      caption: captionHtml,
      parse_mode: 'HTML',
    });
    const req = https.request(
      {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${token}/sendPhoto`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed.ok) resolve(parsed);
            else reject(new Error(parsed.description || 'Telegram sendPhoto error'));
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function sendTelegramMessage(token, chatId, htmlText) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      chat_id: chatId,
      text: htmlText,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    });

    const req = https.request(
      {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${token}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed.ok) resolve(parsed);
            else reject(new Error(parsed.description || 'Telegram API error'));
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function sendVkWallPost(accessToken, groupId, messageText) {
  return new Promise((resolve, reject) => {
    const cleanGroupId = String(groupId).replace(/^-/, '').trim();
    const ownerId = `-${cleanGroupId}`;

    const params = new URLSearchParams({
      owner_id: ownerId,
      from_group: '1',
      message: messageText,
      access_token: accessToken,
      v: '5.199',
    });

    const payload = params.toString();

    const req = https.request(
      {
        hostname: 'api.vk.com',
        port: 443,
        path: '/method/wall.post',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed.response && parsed.response.post_id) {
              resolve(parsed.response);
            } else {
              reject(new Error(parsed.error?.error_msg || 'VK API wall.post error'));
            }
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

export default async function handler(req, res) {
  try {
    // Require CRON_SECRET authorization so external callers cannot spam the channel
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers?.authorization || '';
    const queryKey = req.query?.key || '';
    if (!cronSecret || (authHeader !== `Bearer ${cronSecret}` && queryKey !== cronSecret)) {
      return res.status(401).json({ error: 'Unauthorized cron trigger' });
    }

    const postsPath = path.join(process.cwd(), 'src', 'data', 'telegramPosts.json');
    const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));

    // Allow manual day override via ?day=1..30 or calculate automatically from START_DATE
    let targetDay = req.query?.day ? parseInt(req.query.day, 10) : null;

    if (!targetDay || isNaN(targetDay)) {
      const start = new Date(START_DATE).getTime();
      const now = Date.now();
      const diffDays = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
      targetDay = (diffDays % posts.length) + 1;
    }

    const post = posts.find((p) => p.day === targetDay) || posts[0];

    // 1. Publish to Telegram (with image if post.imageUrl exists and caption <= 1024 chars)
    const htmlMessage = formatToTelegramHtml(post.text, post);
    let tgResult;
    if (post.imageUrl && htmlMessage.length <= 1020) {
      try {
        tgResult = await sendTelegramPhoto(
          TELEGRAM_BOT_TOKEN,
          TELEGRAM_CHAT_ID,
          `https://banya-school.ru${post.imageUrl}`,
          htmlMessage
        );
      } catch {
        tgResult = await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, htmlMessage);
      }
    } else {
      tgResult = await sendTelegramMessage(
        TELEGRAM_BOT_TOKEN,
        TELEGRAM_CHAT_ID,
        htmlMessage
      );
    }

    // 2. Publish to VKontakte (if VK_ACCESS_TOKEN and VK_GROUP_ID are configured)
    let vkResult = null;
    let vkError = null;
    if (VK_ACCESS_TOKEN && VK_GROUP_ID) {
      try {
        const vkText = formatToVkText(post.text, post);
        vkResult = await sendVkWallPost(VK_ACCESS_TOKEN, VK_GROUP_ID, vkText);
      } catch (err) {
        vkError = err.message;
        console.warn('VK auto-post warning:', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      publishedDay: post.day,
      rubric: post.rubric,
      title: post.title,
      telegram: {
        channel: TELEGRAM_CHAT_ID,
        messageId: tgResult.result?.message_id,
      },
      vk: VK_ACCESS_TOKEN && VK_GROUP_ID
        ? {
            groupId: VK_GROUP_ID,
            postId: vkResult?.post_id || null,
            error: vkError,
          }
        : 'skipped (set VK_ACCESS_TOKEN and VK_GROUP_ID in env to enable)',
    });
  } catch (error) {
    console.error('Auto-Publish Cron Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to publish daily post',
    });
  }
}
