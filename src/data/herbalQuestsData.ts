export type HerbalTargetQuest = 'relax' | 'congestion' | 'vigor' | 'detox';

export interface HerbalQuestConfig {
  id: HerbalTargetQuest;
  title: string;
  shortGoal: string;
  clientRequest: string;
  icon: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  bestRecipeNames: string[];
  requiredHerbIds: string[];
  alternativeHerbIds?: string[];
  synergyExplanation: {
    mechanism: string;
    physiology: string;
    sensations: string;
  };
}

export const HERBAL_QUESTS: HerbalQuestConfig[] = [
  {
    id: 'relax',
    title: 'Релакс & Глубокий сон',
    shortGoal: 'Снять спазмы сосудов, остановить мысли и погрузить в сон',
    clientRequest: 'Гость истощен стрессом, плохой сон, тревожность и спазмированные плечи',
    icon: '🌙',
    color: 'text-indigo-300',
    badgeBg: 'bg-indigo-500/10',
    badgeBorder: 'border-indigo-500/30',
    bestRecipeNames: ['Ромашка аптечная', 'Мелисса', 'Донник жёлтый'],
    // 2-3 herbs matching relaxation & sleep
    requiredHerbIds: ['chamomile', 'lemon_mint', 'sweet_clover'],
    alternativeHerbIds: ['oregano', 'linden'],
    synergyExplanation: {
      mechanism: 'Кумарины донника снижают вязкость крови и спазм сосудов, эфирные масла мелиссы (цитраль) выравнивают ритм сердца, а хамазулен ромашки успокаивает ЦНС.',
      physiology: 'Переключение нервной системы из режима стресса (симпатика) в глубокое восстановление (парасимпатика). Снижение уровня кортизола.',
      sensations: 'Тёплый медово-луговой обволакивающий пар, приятная тяжёлая нега в мышцах, сладкая дремота.',
    },
  },
  {
    id: 'congestion',
    title: 'Заложенность носа & Чистые бронхи',
    shortGoal: 'Снять отек слизистых, раскрыть дыхание и очистить пазухи',
    clientRequest: 'Нос не дышит, ощущение заложенности в груди, тяжелая голова',
    icon: '🌬️',
    color: 'text-sky-300',
    badgeBg: 'bg-sky-500/10',
    badgeBorder: 'border-sky-500/30',
    bestRecipeNames: ['Эвкалипт узколистный', 'Пихта сибирская', 'Шалфей лекарственный'],
    requiredHerbIds: ['narrow_eucalyptus', 'siberian_fir', 'sage'],
    alternativeHerbIds: ['round_eucalyptus', 'ledum'],
    synergyExplanation: {
      mechanism: 'Цинеол эвкалипта моментально сужает отечные капилляры носоглотки, борнилацетат пихты уничтожает вирусы в альвеолах, а сальвин шалфея дезинфицирует дыхательные пути.',
      physiology: 'Активация мерцательного эпителия бронхов, разжижение слизи, мощный противоотечный и антибактериальный эффект без пересушивания слизистой.',
      sensations: 'Хрустальный пронзительный вдох, прохладная свежесть тайги в легких, нос свободно открывается уже на первой минуте.',
    },
  },
  {
    id: 'vigor',
    title: 'Бодрость & Богатырский тонус',
    shortGoal: 'Прогнать вялость, наполнить тело силой и ясностью ума',
    clientRequest: 'Упадок сил, туман в голове, мышечная слабость и апатия',
    icon: '⚡',
    color: 'text-amber-300',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/30',
    bestRecipeNames: ['Полынь горькая', 'Можжевельник', 'Дуб кавказский'],
    requiredHerbIds: ['wormwood', 'juniper', 'oak_pedunculate'],
    alternativeHerbIds: ['siberian_cedar', 'tansy'],
    synergyExplanation: {
      mechanism: 'Горькие сесквитерпены полыни тонизируют центры коры мозга, терпены можжевельника стимулируют кровоток и кожные рецепторы, а танины дуба укрепляют сосудистое русло.',
      physiology: 'Выброс адреналина в физиологических дозах, улучшение венозного возврата, исчезновение сонной вялости и повышение мышечного тонуса.',
      sensations: 'Плотный смолисто-степной дух с благородной горчинкой, кристальная ясность мыслей и прилив физической уверенности.',
    },
  },
  {
    id: 'detox',
    title: 'Детокс организма & Выход шлаков',
    shortGoal: 'Раскрыть все поры кожи, стимулировать потоотделение и дренаж',
    clientRequest: 'Отечность, застой лимфы, тяжесть в теле после застолья или переутомления',
    icon: '💧',
    color: 'text-emerald-300',
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/30',
    bestRecipeNames: ['Берёза повислая', 'Липа мелколистная', 'Крапива двудомная'],
    requiredHerbIds: ['silver_birch', 'linden', 'nettle'],
    alternativeHerbIds: ['helichrysum', 'yarrow'],
    synergyExplanation: {
      mechanism: 'Фарнезол липы вызывает обильный «седьмой пот», бетулин березы как сорбент связывает токсины на коже, а муравьиная кислота крапивы разгоняет микрокапиллярный кровоток.',
      physiology: 'Форсированный диафорез (вывод солей мочевой кислоты, метаболитов и лишней межтканевой жидкости через 2 миллиона потовых желез).',
      sensations: 'Шелковистый мягкий пар с медовым шлейфом, обильное легкое потоотделение, чувство невероятной легкости в теле («как заново родился»).',
    },
  },
];
