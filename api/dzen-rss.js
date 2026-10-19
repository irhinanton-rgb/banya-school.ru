import fs from 'fs';
import path from 'path';

function escapeXml(unsafe = '') {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDzenHtml(rawText = '', takeaway = '', day = 1) {
  let html = escapeXml(rawText);
  html = html.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  html = html.replace(/\*([^*\n]+)\*/g, '<i>$1</i>');
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2">$1</a>');

  const paragraphs = html
    .split(/\n\s*\n/)
    .map((p) => p.trim().replace(/\n/g, '<br/>'))
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`);

  if (takeaway) {
    paragraphs.push(`<blockquote><b>📌 Главный вывод Бати:</b> ${escapeXml(takeaway)}</blockquote>`);
  }

  paragraphs.push(
    '<figure><img src="https://banya-school.ru/images/levels/level-1-hero.jpg" /><figcaption>Интерактивная школа банного мастерства «Пармастер Квест» — banya-school.ru</figcaption></figure>'
  );
  paragraphs.push(
    `<p><a href="https://banya-school.ru/?utm_source=dzen&amp;utm_campaign=day_${day}">🔥 Пройти бесплатный интерактивный симулятор русской печи и тренажер пармастера на banya-school.ru</a></p>`
  );

  return paragraphs.join('\n');
}

export default function handler(req, res) {
  try {
    const postsPath = path.join(process.cwd(), 'src', 'data', 'telegramPosts.json');
    const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));

    const startTimestamp = new Date('2026-10-15T07:00:00Z').getTime();
    const now = Date.now();
    const daysPassed = Math.max(1, Math.floor((now - startTimestamp) / (1000 * 60 * 60 * 24)) + 1);

    const showAll = req.query?.all === '1';
    const maxDay = showAll ? posts.length : Math.min(posts.length, Math.max(3, daysPassed));

    const itemsXml = [];
    for (let i = maxDay - 1; i >= 0; i--) {
      const post = posts[i];
      const day = post.day;
      const itemTime = Math.min(now, startTimestamp + (day - 1) * 86400 * 1000);
      const pubDate = new Date(itemTime).toUTCString();
      const title = escapeXml(post.title);
      const rubric = escapeXml(post.rubric || 'Банное мастерство');
      const desc = escapeXml(post.keyTakeaway || post.title);
      const contentHtml = formatDzenHtml(post.text, post.keyTakeaway, day);
      const link = `https://banya-school.ru/?day=${day}`;

      itemsXml.push(`    <item>
      <title>${title}</title>
      <link>${link}</link>
      <pdalink>${link}</pdalink>
      <guid isPermaLink="false">banya-school-ru-post-day-${day}</guid>
      <pubDate>${pubDate}</pubDate>
      <media:rating scheme="urn:simple">nonadult</media:rating>
      <category>${rubric}</category>
      <enclosure url="https://banya-school.ru/images/levels/level-1-hero.jpg" type="image/jpeg" />
      <description><![CDATA[${desc}]]></description>
      <content:encoded><![CDATA[
${contentHtml}
      ]]></content:encoded>
    </item>`);
    }

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:georss="http://www.georss.org/georss">
  <channel>
    <title>Батя в Бане | Школа Банного Мастерства</title>
    <link>https://banya-school.ru</link>
    <description>Официальный канал интерактивной школы пармастеров Антона Ирхина: анатомия лёгкого пара 60/60, биомеханика веников, фитотерапия и безопасность в русской бане.</description>
    <language>ru</language>
${itemsXml.join('\n')}
  </channel>
</rss>`;

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    return res.status(200).send(rss);
  } catch (e) {
    return res.status(500).send('RSS generation error: ' + e.message);
  }
}
