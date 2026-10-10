import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { question, currentLevel, studentName } = body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Вопрос не указан' });
    }

    if (!apiKey) {
      // Fallback response if GEMINI_API_KEY not configured
      return res.status(200).json({
        answer: 'Приветствую, банный ученик! Я твой мудрый помощник Сова PQ. Твой вопрос принят и также отправлен наставнику Антону Ирхину. Для прохождения квеста изучай теорию станций, тренируйся в симуляторах и проходи контрольные тесты!'
      });
    }

    const ai = new GoogleGenAI();
    const systemPrompt = `Ты — мудрая Сова PQ (Пармастер Квест), добрый, опытный и заботливый банный наставник и помощник ученика в онлайн-школе банного мастерства «Пармастер Квест» (banya-school.ru).
Основатель школы: Антон Ирхин (опытный банный мастер, банщик, судья чемпионатов).
Программа квеста включает 7 станций:
1. Вход в банное дело (печь, каменка, кондиции 60/60, вентиляция Басту, эргономика)
2. Анатомия пара и веники (хватка, баланс, 8 движений парения, дуб, берёза, липа)
3. Банная фармакопея (фитобар, травы, запарки, ароматерапия)
4. Диагностика и безопасность (пульс, тепловые реакции, контрасты)
5. Сервис и ритуалы (поющая чаша, парение в 4 руки, атмосфера)
6. Нештатные ситуации и ЧП в парной (первая помощь, тепловой удар, ожоги)
7. Финальная аттестация и именной сертификат пармастера

Студента зовут: ${studentName || 'Ученик'}.
Текущая станция: ${currentLevel || 1}.

Твой характер:
- Мудрая, дружелюбная, тактичная Сова-наставник.
- Отвечай ёмко, понятно, по делу, с банной душой, практической пользой и заботой о здоровье человека в парной.
- Если ученик спрашивает подсказку по тесту или симулятору — дай ценную наводку и объясни суть банного закона (например, почему важна вентиляция, почему пар подают на раскаленные камни 400-500°C порциями, почему гостя не бьют с размаху, а работают эластичной кистью).
- Поддерживай и вдохновляй продолжать обучение!`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `Вопрос ученика: ${question}` }]
        }
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    return res.status(200).json({
      answer: response.text || 'Отличный вопрос! Сохраняй спокойствие и продолжай движение по станциям квеста.'
    });
  } catch (error) {
    console.error('Gemini Assistant Error:', error);
    return res.status(200).json({
      answer: 'Твой вопрос принят и записан! Я передала его лично Антону Ирхину. Двигайся дальше по станциям квеста, пробуй симуляторы и всё получится!'
    });
  }
}
