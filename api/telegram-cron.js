import fs from 'fs';
import path from 'path';
import https from 'https';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7992502826:AAFaVxzLifwnqRGnV1q3OhUmx4Ykz2C5OBU';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '@BatyaVBane';

const VK_ACCESS_TOKEN = process.env.VK_ACCESS_TOKEN || 'vk1.a.1y5Haqf_ujhVhQCDET6yww5f4IbAQ1s2e5MyCo9dSLkuuCxZ8sduqFEtbWwRXduGSH_1Psl06QqmGPjZAW49Z7haUlbYoFQ41phVaxI8WywulnukFznXP_iUwE_-8s_0HfXEP-fcg_PSefXzWbEtW-VnbB1cX_lrjEOxd58dC_ULXRrKfX7obVphtUCTEbY7HHJyf_ygQlHKoaWLIsLasg';
const VK_GROUP_ID = process.env.VK_GROUP_ID || '242053676';

function markdownToTelegramHtml(text) {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2">$1</a>');

  return html;
}

// Post to Telegram Channel
function postToTelegram(post) {
  return new Promise((resolve) => {
    const messageHtml = markdownToTelegramHtml(post.text);
    const payload = JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: messageHtml,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🌿 Банная Академия & Справочник',
              url: 'https://banya-school.ru'
            }
          ]
        ]
      }
    });

    const request = https.request(
      {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      resp => {
        let data = '';
        resp.on('data', chunk => { data += chunk; });
        resp.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve({ ok: false, error: e.message });
          }
        });
      }
    );
    request.on('error', (err) => resolve({ ok: false, error: err.message }));
    request.write(payload);
    request.end();
  });
}

// Post to VK Community Wall
function postToVk(post) {
  return new Promise((resolve) => {
    const cleanText = post.text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '$1: $2');

    const message = `${cleanText}\n\n📖 Интерактивный Банный Справочник и Симуляторы: https://banya-school.ru`;

    const params = new URLSearchParams({
      v: '5.199',
      access_token: VK_ACCESS_TOKEN,
      owner_id: `-${VK_GROUP_ID}`,
      from_group: '1',
      message: message
    });

    const request = https.request(
      {
        hostname: 'api.vk.com',
        port: 443,
        path: '/method/wall.post',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      },
      resp => {
        let data = '';
        resp.on('data', chunk => { data += chunk; });
        resp.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve({ error: e.message });
          }
        });
      }
    );
    request.on('error', (err) => resolve({ error: err.message }));
    request.write(params.toString());
    request.end();
  });
}

export default async function handler(req, res) {
  try {
    const postsPath = path.join(process.cwd(), 'src/data/telegramPosts.json');
    const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

    // Determine target day of post
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const queryDay = req.query && req.query.day ? parseInt(req.query.day) : null;
    const targetDay = queryDay || ((dayOfYear % posts.length) + 1);

    const post = posts.find(p => p.day === targetDay) || posts[0];

    // Publish in parallel to Telegram and VK
    const [tgRes, vkRes] = await Promise.all([
      postToTelegram(post),
      postToVk(post)
    ]);

    return res.status(200).json({
      success: true,
      day: post.day,
      title: post.title,
      telegram: {
        ok: tgRes.ok,
        message_id: tgRes.result?.message_id || null,
        error: tgRes.description || tgRes.error || null
      },
      vk: {
        ok: !!vkRes.response?.post_id,
        post_id: vkRes.response?.post_id || null,
        error: vkRes.error?.error_msg || vkRes.error || null
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
