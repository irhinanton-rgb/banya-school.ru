const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables or CLI arguments
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.argv[2];
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || process.argv[3];
const SPECIFIC_DAY = process.env.DAY || process.argv[4];

if (!BOT_TOKEN || !CHAT_ID) {
  console.error('Error: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be provided.');
  console.error('Usage: node scripts/publishToTelegram.js <BOT_TOKEN> <CHAT_ID> [DAY]');
  process.exit(1);
}

const postsPath = path.join(__dirname, '../src/data/telegramPosts.json');
const statePath = path.join(__dirname, '../src/data/telegramPostingState.json');

const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

// Determine which post to publish
let state = { nextDay: 1, history: [] };
if (fs.existsSync(statePath)) {
  try {
    state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  } catch (e) {
    console.warn('Could not parse state file, starting from day 1');
  }
}

let targetDay = SPECIFIC_DAY ? parseInt(SPECIFIC_DAY) : (state.nextDay || 1);
if (targetDay > 30) targetDay = 1;

const post = posts.find(p => p.day === targetDay) || posts[0];

console.log(`Preparing to send Post for Day ${post.day}: "${post.title}" to ${CHAT_ID}`);

// Convert Markdown to Telegram HTML format
function markdownToTelegramHtml(text) {
  let html = text
    // Escape HTML special characters first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold: **text** -> <b>text</b>
  html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

  // Italic: *text* -> <i>$1</i>
  html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');

  // Links: [text](url) -> <a href="url">text</a>
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2">$1</a>');

  return html;
}

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

const req = https.request(
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
  res => {
    let responseData = '';
    res.on('data', chunk => {
      responseData += chunk;
    });
    res.on('end', () => {
      try {
        const result = JSON.parse(responseData);
        if (result.ok) {
          console.log(`Success! Post for Day ${post.day} was published to Telegram channel.`);
          console.log(`Message ID: ${result.result.message_id}`);
          state.nextDay = (post.day % 30) + 1;
          state.lastPublishedAt = new Date().toISOString();
          state.lastDayPublished = post.day;
          state.history.push({ day: post.day, date: state.lastPublishedAt, message_id: result.result.message_id });
          fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
        } else {
          console.error('Telegram API error:', result.description);
          process.exit(1);
        }
      } catch (err) {
        console.error('Failed to parse response:', err, responseData);
        process.exit(1);
      }
    });
  }
);

req.on('error', error => {
  console.error('Request error:', error);
  process.exit(1);
});

req.write(payload);
req.end();
