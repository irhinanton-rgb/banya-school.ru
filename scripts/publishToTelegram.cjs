const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables or CLI arguments
const BOT_TOKEN = process.env.BATYA_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || process.argv[2] || '7992502826:AAFaVxzLifwnqRGnV1q3OhUmx4Ykz2C5OBU';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || process.argv[3] || '@BatyaVBane';
const DAY_ARG = process.argv[4]; // Optional: specific day number (1..30) or "all"

const VK_ACCESS_TOKEN = process.env.VK_ACCESS_TOKEN || 'vk1.a.1y5Haqf_ujhVhQCDET6yww5f4IbAQ1s2e5MyCo9dSLkuuCxZ8sduqFEtbWwRXduGSH_1Psl06QqmGPjZAW49Z7haUlbYoFQ41phVaxI8WywulnukFznXP_iUwE_-8s_0HfXEP-fcg_PSefXzWbEtW-VnbB1cX_lrjEOxd58dC_ULXRrKfX7obVphtUCTEbY7HHJyf_ygQlHKoaWLIsLasg';
const VK_GROUP_ID = process.env.VK_GROUP_ID || '242053676';

const postsPath = path.join(__dirname, '..', 'src', 'data', 'telegramPosts.json');
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));

/**
 * Converts Markdown-like syntax in our content plan to Telegram HTML
 */
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

function formatToVkText(rawText, postMeta = {}) {
  let text = rawText.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, (m, label, url) =>
    label.includes('banya-school.ru') ? url : `${label} (${url})`
  );
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*\n]+)\*/g, '$1');

  const header = postMeta.rubric ? `${postMeta.rubric} | День ${postMeta.day}/30\n\n` : '';
  const takeaway = postMeta.keyTakeaway ? `\n\n📌 Главный вывод Бати:\n${postMeta.keyTakeaway}` : '';
  return `${header}${text}${takeaway}`;
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
            if (parsed.ok) {
              resolve(parsed);
            } else {
              reject(new Error(`Telegram API Error: ${parsed.description || body}`));
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

function sendVkWallPost(accessToken, groupId, messageText) {
  return new Promise((resolve, reject) => {
    const cleanGroupId = String(groupId).replace(/^-/, '').trim();
    const params = new URLSearchParams({
      owner_id: `-${cleanGroupId}`,
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

async function run() {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.log('Использование:');
    console.log('  node scripts/publishToTelegram.cjs <BOT_TOKEN> <@channel_or_chat_id> [day_number]');
    console.log('Или через переменные окружения:');
    console.log('  TELEGRAM_BOT_TOKEN=xxx TELEGRAM_CHAT_ID=@my_banya_channel VK_ACCESS_TOKEN=yyy VK_GROUP_ID=123456 node scripts/publishToTelegram.cjs 1');
    process.exit(1);
  }

  // If only 1 argument was passed (e.g. `node scripts/publishToTelegram.cjs 5`), treat it as day number
  let targetDay = DAY_ARG;
  if (process.argv.length === 3 && process.env.TELEGRAM_BOT_TOKEN) {
    targetDay = process.argv[2];
  } else if (process.argv.length === 3 && /^\d+$/.test(process.argv[2])) {
    targetDay = process.argv[2];
  }

  const dayNum = parseInt(targetDay || '1', 10);
  const post = posts.find((p) => p.day === dayNum);

  if (!post) {
    console.error(`Пост для дня #${dayNum} не найден (доступны дни 1..30).`);
    process.exit(1);
  }

  console.log(`Отправка поста День #${post.day}: "${post.title}" в ${CHAT_ID}...`);
  const html = formatToTelegramHtml(post.text, post);
  const res = await sendTelegramMessage(BOT_TOKEN, CHAT_ID, html);
  console.log(`✅ Успешно опубликовано в Telegram! Message ID: ${res.result.message_id}`);

  if (VK_ACCESS_TOKEN && VK_GROUP_ID) {
    console.log(`Отправка поста День #${post.day} в группу ВКонтакте (-${VK_GROUP_ID})...`);
    const vkRes = await sendVkWallPost(VK_ACCESS_TOKEN, VK_GROUP_ID, formatToVkText(post.text, post));
    console.log(`✅ Успешно опубликовано во ВКонтакте! Post ID: ${vkRes.post_id}`);
  }
}

run().catch((err) => {
  console.error('❌ Ошибка публикации:', err.message);
  process.exit(1);
});
