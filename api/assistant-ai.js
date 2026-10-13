import { GoogleGenAI } from '@google/genai';
import { broadcastToAdmins, escapeHtml } from './telegram-notifier.js';

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
    const { question, currentLevel, studentName, userEmail } = body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Вопрос не указан' });
    }

    // Contextual expert response helper for bath master questions
    const getExpertAnswer = (q) => {
      const lower = q.toLowerCase();
      if (lower.includes('запар') || lower.includes('веник') || lower.includes('дуб') || lower.includes('берез')) {
        return `Ух! 🦉 Приветствую тебя, ${studentName || 'Александр'}!\n\n🪵 **Дуб или Берёза — что выбрать?**\n• **Дуб (Царь пара):** Обладает широким, прочным листом и крепкой структурой. Идеален для плотного зачерпывания пара из пирога и глубокого прогрева тела. Содержит танины, матирует кожу, снимает стресс и снижает давление. Служит до 3–5 парений.\n• **Берёза (Целительница):** Лист мягкий, шелковистый, пористый с природным дегтем. Прилипает к распаренному телу как губка, вытягивая токсины и глубоко очищая бронхи. Незаменима при болях в мышцах и суставах после тренировок.\n• *Секрет пармастера:* Начинай омахивание мягкой берёзой, а основной прогрев делай крепким дубом!\n\n🌿 **Как правильно запарить веник (Главное правило):**\nНи в коем случае не заливай веник крутым кипятком! От кипятка лист сварится, станет склизким и облетит за 5 минут.\n1. Ополосни веник в прохладной воде от пыли.\n2. Помести в таз с тёплой водой (40–45°C) на 15–20 минут.\n3. Перед заходом подержи 30 секунд над паром каменки (не касаясь камней!) — веник задышит и наполнит парную живым ароматом!`;
      }
      if (lower.includes('температур') || lower.includes('пар') || lower.includes('60/60') || lower.includes('влажност') || lower.includes('градус')) {
        return `Ух! 🦉 Золотой стандарт русской паровой бани — **кондиции 60/60** (60°C тепла на полке и 60% относительной влажности). При таком балансе («Правило 120») тепло проникает глубоко в тело без ожога дыхательных путей.\n\nГлавный секрет лёгкого пара — температура камней в закрытой каменке должна быть **400–500°C**. Вода подается малыми порциями по 100–150 мл на раскаленные глубинные камни, превращаясь в невидимый сухой бархатный пар!`;
      }
      if (lower.includes('конвекци') || lower.includes('печ') || lower.includes('задвижк')) {
        return `Ух! 🦉 Конвекция — это круговорот горячего воздуха от печи. При растопке бани задвижки конвекции **открывают на максимум**, чтобы быстро и равномерно прогреть стены и полок до 60°C. А во время парения и подачи пара задвижки **обязательно перекрывают**, чтобы сухой сквозняк не разрушал паровой пирог под потолком!`;
      }
      if (lower.includes('хват') || lower.includes('движен') || lower.includes('держать')) {
        return `Ух! 🦉 Веник держат мягко, не пережимая рукоять, работая эластичной кистью, а не напряженным плечом. 8 базовых движений: опахивание, омахивание, поглаживание, компресс (припарка), растирание, растяжка, стегание и веерный прогрев!`;
      }
      if (lower.includes('вентиляц') || lower.includes('басту') || lower.includes('дыхан') || lower.includes('кислород')) {
        return `Ух! 🦉 В бане греет пар, а лечит кислород! Вентиляция Басту подает свежий уличный воздух под печь, а вытяжка отбирает тяжелый отработанный воздух у пола по диагонали. А «Второе дыхание» подает прохладный воздух прямо к лицу лежащего гостя под пихтовый венок!`;
      }
      return null;
    };

    const expertAnswer = getExpertAnswer(question);

    if (!apiKey) {
      const finalAnswer = expertAnswer || `Ух! 🦉 Вопрос принят, ${studentName || 'ученик'}! Для лёгкого пара держи кондиции 60/60, камни 400-500°C и работай эластичной кистью. Вопрос передан лично Антону Ирхину!`;
      
      // Notify Telegram
      broadcastToAdmins(
        [
          `🦉 <b>[Сова PQ] Вопрос ученика по квесту</b>`,
          ``,
          `👤 <b>Ученик:</b> ${escapeHtml(studentName || 'Ученик')} (Станция ${currentLevel || 1})`,
          userEmail ? `📧 <b>Email:</b> ${escapeHtml(userEmail)}` : null,
          `🕒 <b>Время:</b> ${new Date().toLocaleString('ru-RU')}`,
          ``,
          `❓ <b>Вопрос:</b>`,
          escapeHtml(question),
          ``,
          `💡 <b>Ответ Совы PQ:</b>`,
          escapeHtml(finalAnswer),
        ].filter(Boolean).join('\n')
      ).catch((e) => console.warn('TG broadcast warning:', e));

      return res.status(200).json({ answer: finalAnswer });
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

    const generatedAnswer = response.text || 'Отличный вопрос! Сохраняй спокойствие и продолжай движение по станциям квеста.';

    // Broadcast student question and Owl's answer directly to Anton's Telegram bot!
    broadcastToAdmins(
      [
        `🦉 <b>[Сова PQ] Вопрос ученика по квесту</b>`,
        ``,
        `👤 <b>Ученик:</b> ${escapeHtml(studentName || 'Ученик')} (Станция ${currentLevel || 1})`,
        userEmail ? `📧 <b>Email:</b> ${escapeHtml(userEmail)}` : null,
        `🕒 <b>Время:</b> ${new Date().toLocaleString('ru-RU')}`,
        ``,
        `❓ <b>Вопрос ученика:</b>`,
        escapeHtml(question),
        ``,
        `💡 <b>Ответ Совы PQ:</b>`,
        escapeHtml(generatedAnswer),
      ].filter(Boolean).join('\n')
    ).catch((e) => console.warn('TG broadcast warning:', e));

    return res.status(200).json({
      answer: generatedAnswer
    });
  } catch (error) {
    console.error('Gemini Assistant Error:', error);
    
    let fallbackAnswer = null;
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const q = (body.question || '').toLowerCase();
      const sName = body.studentName || 'Александр';
      if (q.includes('запар') || q.includes('веник') || q.includes('дуб') || q.includes('берез')) {
        fallbackAnswer = `Ух! 🦉 Приветствую тебя, ${sName}!\n\n🪵 **Дуб или Берёза — что лучше?**\n• **Дуб:** плотный, прочный лист, забирает максимум пара из пирога, содержит танины, матирует кожу и стабилизирует давление. Служит до 3–5 парений.\n• **Берёза:** нежный пористый лист, как губка впитывает пот и токсины, прочищает бронхи и снимает боль в мышцах.\n• *Секрет пармастера:* прогревай берёзой, а припарки и мощный пар делай дубом!\n\n🌿 **Как правильно запарить веник:**\nНикогда не заливай кипятком! Ополосни в прохладной воде, затем замочи в тёплой воде (40–45°C) на 15–20 минут, а перед заходом подержи над паром каменки 30 секунд.`;
      } else if (q.includes('температур') || q.includes('пар') || q.includes('60/60')) {
        fallbackAnswer = `Ух! 🦉 Золотой стандарт русской бани — **кондиции 60/60** (60°C и 60% влажности). Камни в закрытой каменке должны быть раскалены до **400–500°C**, а воду подают малыми порциями по 100–150 мл.`;
      } else if (q.includes('конвекци') || q.includes('печ')) {
        fallbackAnswer = `Ух! 🦉 При растопке бани задвижки конвекции открывают настежь, чтобы нагреть парную до 60°C. А во время парения задвижки обязательно закрывают, чтобы не разрушать паровой пирог под потолком!`;
      }
    } catch {
      // ignore
    }

    if (!fallbackAnswer) {
      fallbackAnswer = 'Ух! 🦉 Твой вопрос принят мудрой Совой! Держи кондиции 60/60, прогревай каменку до 400-500°C и работай эластичной кистью. Вопрос передан лично Антону Ирхину!';
    }

    // Still notify Telegram about the student's question and answer
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      if (body.question) {
        broadcastToAdmins(
          [
            `🦉 <b>[Сова PQ] Вопрос ученика по квесту</b>`,
            ``,
            `👤 <b>Ученик:</b> ${escapeHtml(body.studentName || 'Ученик')}`,
            `🕒 <b>Время:</b> ${new Date().toLocaleString('ru-RU')}`,
            ``,
            `❓ <b>Вопрос ученика:</b>`,
            escapeHtml(body.question),
            ``,
            `💡 <b>Ответ Совы PQ:</b>`,
            escapeHtml(fallbackAnswer),
          ].join('\n')
        ).catch(() => {});
      }
    } catch {
      // ignore
    }

    return res.status(200).json({
      answer: fallbackAnswer
    });
  }
}
