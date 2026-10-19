const fs = require('fs');
const path = require('path');
const https = require('https');

const TELEGRAM_BOT_TOKEN = process.env.BATYA_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '7992502826:AAFaVxzLifwnqRGnV1q3OhUmx4Ykz2C5OBU';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '@BatyaVBane';

const VK_ACCESS_TOKEN = process.env.VK_ACCESS_TOKEN || '';
const VK_GROUP_ID = process.env.VK_GROUP_ID || '';

// Daily publication time in Moscow Time (UTC+3), default 10:00
const PUBLISH_HOUR_MSK = parseInt(process.env.PUBLISH_HOUR_MSK || '10', 10);
const PUBLISH_MINUTE_MSK = parseInt(process.env.PUBLISH_MINUTE_MSK || '0', 10);

const postsPath = path.join(__dirname, '..', 'src', 'data', 'telegramPosts.json');
const statePath = path.join(__dirname, '.publisher-state.json');

function formatToTelegramHtml(rawText, postMeta = {}) {
  let html = rawText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  html = html.replace(/\*([^*\n]+)\*/g, '<i>$1</i>');
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

function sendTelegram(htmlText) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: htmlText,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    });
    const req = https.request(
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
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
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

function sendVk(messageText) {
  return new Promise((resolve, reject) => {
    const cleanGroupId = String(VK_GROUP_ID).replace(/^-/, '').trim();
    const params = new URLSearchParams({
      owner_id: `-${cleanGroupId}`,
      from_group: '1',
      message: messageText,
      attachments: 'https://banya-school.ru',
      access_token: VK_ACCESS_TOKEN,
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
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed.response?.post_id) resolve(parsed.response);
            else reject(new Error(parsed.error?.error_msg || 'VK error'));
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

function getState() {
  try {
    if (fs.existsSync(statePath)) {
      return JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    }
  } catch (e) {}
  return { lastPublishedDate: null, nextDay: 1 };
}

function saveState(state) {
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf-8');
}

async function publishNextDay() {
  const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
  const state = getState();
  const dayToPublish = ((state.nextDay - 1) % posts.length) + 1;
  const post = posts.find((p) => p.day === dayToPublish) || posts[0];

  console.log(`📤 Публикация Дня ${post.day}: "${post.title}"...`);
  const tgRes = await sendTelegram(formatToTelegramHtml(post.text, post));
  console.log(`✅ Telegram (@BatyaVBane): опубликовано (ID: ${tgRes.result.message_id})`);

  if (VK_ACCESS_TOKEN && VK_GROUP_ID) {
    try {
      const vkRes = await sendVk(formatToVkText(post.text, post));
      console.log(`✅ ВКонтакте (группа -${VK_GROUP_ID}): опубликовано (post_id: ${vkRes.post_id})`);
    } catch (e) {
      console.error(`⚠️ Ошибка ВК:`, e.message);
    }
  }

  const nowMsk = new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10);
  saveState({
    lastPublishedDate: nowMsk,
    nextDay: (post.day % posts.length) + 1,
  });
}

async function tick() {
  const nowMskDate = new Date(Date.now() + 3 * 3600 * 1000);
  const todayStr = nowMskDate.toISOString().slice(0, 10);
  const hour = nowMskDate.getUTCHours();
  const minute = nowMskDate.getUTCMinutes();

  const state = getState();
  if (state.lastPublishedDate !== todayStr && hour === PUBLISH_HOUR_MSK && minute >= PUBLISH_MINUTE_MSK) {
    try {
      await publishNextDay();
    } catch (err) {
      console.error('❌ Ошибка автопубликации:', err.message);
    }
  }
}

console.log(`🚀 Запущен авто-паблишер (TG: ${TELEGRAM_CHAT_ID}${VK_GROUP_ID ? `, VK: -${VK_GROUP_ID}` : ''})`);
console.log(`⏰ Расписание: каждый день в ${String(PUBLISH_HOUR_MSK).padStart(2, '0')}:${String(PUBLISH_MINUTE_MSK).padStart(2, '0')} МСК`);

if (process.argv.includes('--now')) {
  publishNextDay().catch(console.error);
} else {
  setInterval(tick, 30 * 1000);
  tick();
}
