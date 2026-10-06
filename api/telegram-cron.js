import fs from 'fs';
import path from 'path';
import https from 'https';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7992502826:AAFaVxzLifwnqRGnV1q3OhUmx4Ykz2C5OBU';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '@BatyaVBane';

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

export default async function handler(req, res) {
  try {
    const postsPath = path.join(process.cwd(), 'src/data/telegramPosts.json');
    const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

    // Calculate day index based on day of year or query param
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const queryDay = req.query && req.query.day ? parseInt(req.query.day) : null;
    const targetDay = queryDay || ((dayOfYear % posts.length) + 1);

    const post = posts.find(p => p.day === targetDay) || posts[0];
    const messageHtml = markdownToTelegramHtml(post.text);

    const payload = JSON.stringify({
      chat_id: CHAT_ID,
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

    const response = await new Promise((resolve, reject) => {
      const request = https.request(
        {
          hostname: 'api.telegram.org',
          port: 443,
          path: `/bot${BOT_TOKEN}/sendMessage`,
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
              reject(e);
            }
          });
        }
      );
      request.on('error', reject);
      request.write(payload);
      request.end();
    });

    if (response.ok) {
      return res.status(200).json({
        success: true,
        message: `Post for Day ${post.day} published successfully`,
        message_id: response.result.message_id,
        title: post.title
      });
    } else {
      return res.status(500).json({
        success: false,
        error: response.description
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
