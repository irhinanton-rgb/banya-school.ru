import { sendTelegramToChat, escapeHtml } from './telegram-notifier.js';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: 'Telegram Webhook is live' });
  }

  try {
    const update = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const message = update.message;

    if (!message || !message.chat) {
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = (message.text || '').trim();
    const fromName = message.from?.first_name || 'Банный мастер';

    // 1. Command: /start or /help
    if (text.startsWith('/start') || text.startsWith('/help')) {
      const welcome = [
        `🦉 <b>Мудрая Сова PQ приветствует вас, ${escapeHtml(fromName)}!</b>`,
        ``,
        `Я — официальный ИИ-помощник и наставник онлайн-школы <b>«Пармастер Квест»</b> (banya-school.ru).`,
        ``,
        `🔔 <b>В этот чат мгновенно поступают:</b>`,
        `• ❓ Вопросы учеников квеста с ответами Совы PQ`,
        `• 🐞 Сообщения о багах и ошибках на сайте`,
        `• ⭐ Отзывы и впечатления учеников`,
        `• 💳 <b>Уведомления об оплате курса «Мастер Пара PRO»</b>`,
        ``,
        `💡 <i>Вы также можете написать мне любой вопрос по банному делу, кондициям 60/60, технике веников или работе школы — я отвечу прямо здесь!</i>`,
      ].join('\n');

      await sendTelegramToChat(chatId, welcome);
      return res.status(200).json({ ok: true });
    }

    // 2. Command: /status
    if (text.startsWith('/status')) {
      const statusText = [
        `📊 <b>Статус платформы «Пармастер Квест»:</b>`,
        ``,
        `🌐 <b>Сайт:</b> https://banya-school.ru`,
        `🎓 <b>Курс:</b> 7 интерактивных станций`,
        `🤖 <b>ИИ-помощник:</b> Сова PQ (Gemini 3.5 Flash Lite) — активен`,
        `💳 <b>Платежи ЮKassa:</b> подключены`,
        `🕒 <b>Время сервера:</b> ${new Date().toLocaleString('ru-RU')}`,
        ``,
        `Ух! Пар лёгкий, кондиции в норме! 🦉🔥`,
      ].join('\n');

      await sendTelegramToChat(chatId, statusText);
      return res.status(200).json({ ok: true });
    }

    // 3. User or Mentor asked a question to the Bot in Telegram
    if (text) {
      let replyText = 'Твой вопрос принят мудрой Совой PQ! Для хорошего пара держи кондиции 60/60 и прогревай закрытую каменку до 400-500°C. Ух! 🦉';

      if (apiKey) {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
          });

          const systemPrompt = `Ты — мудрая Сова PQ, банный наставник школы «Пармастер Квест» (основатель — Антон Ирхин, г. Ростов-на-Дону, banya-school.ru).
Ответь собеседнику прямо в Telegram ёмко, душевно, профессионально и по делу. Соблюдай традиции русской бани, мягкого пара и безопасности.`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: [{ role: 'user', parts: [{ text }] }],
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.7,
              maxOutputTokens: 400,
            },
          });

          if (response.text) {
            replyText = response.text;
          }
        } catch (e) {
          console.warn('Telegram AI response error:', e);
        }
      }

      await sendTelegramToChat(chatId, replyText);
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Telegram Webhook Error:', error);
    return res.status(200).json({ ok: false, error: error.message });
  }
}
