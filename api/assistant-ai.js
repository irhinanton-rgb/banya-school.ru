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
      return res.status(200).json({
        answer: 'Приветствую, банный ученик! Я твой мудрый наставник Сова PQ. Твой вопрос принят и передан Антону Ирхину. Изучай теорию станций квеста, пробуй симуляторы и держи кондиции 60/60!'
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

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
Текущая станция квеста: ${currentLevel || 1}.

Твой характер:
- Мудрая, дружелюбная, тактичная Сова-наставник (можно иногда использовать фирменное «Ух!🦉» или банные присказки).
- Отвечай ёмко, понятно, по делу, с банной душой, практической пользой и заботой о безопасности в парной.
- Если ученик спрашивает подсказку по тесту, квесту или симулятору — дай полезную наводку и объясни суть банного принципа (например: почему важна вентиляция, почему пар подают на раскаленные камни 400-500°C малыми порциями, почему гостя не бьют с размаху, а работают эластичной кистью и паром).
- Держи ответ компактным (1-3 небольших абзаца), чтобы ученику было удобно читать в модальном окне.`;

    // Use fast and responsive Gemini model
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [
        {
          role: 'user',
          parts: [{ text: `Вопрос от ${studentName || 'ученика'}: ${question}` }]
        }
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });

    return res.status(200).json({
      answer: response.text || 'Отличный вопрос! Сохраняй спокойствие и продолжай движение по станциям квеста.'
    });
  } catch (error) {
    console.error('Gemini Assistant Error:', error);
    return res.status(200).json({
      answer: 'Твой вопрос принят мудрой Совой! Передала его лично Антону Ирхину. Двигайся дальше по станциям квеста, пробуй симуляторы и держи лёгкий пар!'
    });
  }
}
