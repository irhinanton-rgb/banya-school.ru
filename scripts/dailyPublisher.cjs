const fs = require('fs');
const path = require('path');
const https = require('https');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7992502826:AAFaVxzLifwnqRGnV1q3OhUmx4Ykz2C5OBU';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '@BatyaVBane';

const VK_ACCESS_TOKEN = process.env.VK_ACCESS_TOKEN || 'vk1.a.1y5Haqf_ujhVhQCDET6yww5f4IbAQ1s2e5MyCo9dSLkuuCxZ8sduqFEtbWwRXduGSH_1Psl06QqmGPjZAW49Z7haUlbYoFQ41phVaxI8WywulnukFznXP_iUwE_-8s_0HfXEP-fcg_PSefXzWbEtW-VnbB1cX_lrjEOxd58dC_ULXRrKfX7obVphtUCTEbY7HHJyf_ygQlHKoaWLIsLasg';
const VK_GROUP_ID = process.env.VK_GROUP_ID || '242053676';

const postsPath = path.join(__dirname, '../src/data/telegramPosts.json');
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

const targetDay = process.argv[2] ? parseInt(process.argv[2]) : 1;
const post = posts.find(p => p.day === targetDay) || posts[0];

console.log(`Sending Day ${post.day}: "${post.title}" to Telegram & VK...`);

// 1. Telegram
const messageHtml = post.text
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
  .replace(/\*(.*?)\*/g, '<i>$1</i>')
  .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2">$1</a>');

const tgPayload = JSON.stringify({
  chat_id: TELEGRAM_CHAT_ID,
  text: messageHtml,
  parse_mode: 'HTML',
  reply_markup: {
    inline_keyboard: [[{ text: '🌿 Банная Академия & Справочник', url: 'https://banya-school.ru' }]]
  }
});

const reqTg = https.request({
  hostname: 'api.telegram.org',
  path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(tgPayload) }
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const res = JSON.parse(d);
    console.log(res.ok ? `[TG] Success (msg_id: ${res.result.message_id})` : `[TG] Error: ${res.description}`);
  });
});
reqTg.write(tgPayload);
reqTg.end();

// 2. VKontakte
const vkMessage = `${post.text.replace(/\*\*/g, '').replace(/\*/g, '')}\n\n📖 Интерактивный Банный Справочник и Симуляторы: https://banya-school.ru`;
const vkParams = new URLSearchParams({
  v: '5.199',
  access_token: VK_ACCESS_TOKEN,
  owner_id: `-${VK_GROUP_ID}`,
  from_group: '1',
  message: vkMessage
});

const reqVk = https.request({
  hostname: 'api.vk.com',
  path: '/method/wall.post',
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const res = JSON.parse(d);
    console.log(res.response?.post_id ? `[VK] Success (post_id: ${res.response.post_id})` : `[VK] Error: ${JSON.stringify(res.error)}`);
  });
});
reqVk.write(vkParams.toString());
reqVk.end();
