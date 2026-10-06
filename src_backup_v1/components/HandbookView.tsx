import React, { useState } from 'react';
import { HERBS_DATA, BROOM_TECHNIQUES } from '../data/courseData';
import { BookOpen, Thermometer, ShieldAlert, Heart, Sparkles, Droplets } from 'lucide-react';

export const HandbookView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'climate' | 'techniques' | 'herbs' | 'safety' | 'health'>('climate');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Handbook Header */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <BookOpen className="h-4 w-4" />
          <span>Карманный Справочник Пармастера</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100">
          Профессиональная База Знаний & Стандарты Банного Дела
        </h2>
        <p className="text-xs sm:text-sm text-stone-300 max-w-3xl leading-relaxed">
          Быстрая памятка для практикующего мастера и владельца бани: нормативы микроклимата, противопоказания, фитокомпоненты и эргономика работы в парной.
        </p>

        {/* Section Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-800">
          <button
            onClick={() => setActiveSection('climate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeSection === 'climate'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            🌡️ Режимы и Температуры
          </button>
          <button
            onClick={() => setActiveSection('techniques')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeSection === 'techniques'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            🍃 8 Техник Веника
          </button>
          <button
            onClick={() => setActiveSection('herbs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeSection === 'herbs'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            🏺 Фито-Аптека
          </button>
          <button
            onClick={() => setActiveSection('safety')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeSection === 'safety'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            ⚠️ Противопоказания
          </button>
          <button
            onClick={() => setActiveSection('health')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeSection === 'health'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            🛡️ Здоровье Мастера
          </button>
        </div>
      </div>

      {/* Section 1: Climate */}
      {activeSection === 'climate' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-6 space-y-4">
            <h3 className="font-serif text-xl font-bold text-stone-100 flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-amber-400" />
              <span>Сравнительная таблица микроклиматов бань</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 font-mono uppercase">
                    <th className="py-2.5 px-3">Тип парной</th>
                    <th className="py-2.5 px-3">Температура</th>
                    <th className="py-2.5 px-3">Влажность</th>
                    <th className="py-2.5 px-3">Физика воздействия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/80 text-stone-300">
                  <tr className="hover:bg-stone-950/40">
                    <td className="py-3 px-3 font-semibold text-amber-200">Русская паровая баня</td>
                    <td className="py-3 px-3 font-mono text-emerald-400">60 - 70°C (до 90°C)</td>
                    <td className="py-3 px-3 font-mono text-emerald-400">60 - 70% (до 90%)</td>
                    <td className="py-3 px-3">Глубокий мягкий прогрев паровым пирогом. Работа вениками идеальна.</td>
                  </tr>
                  <tr className="hover:bg-stone-950/40">
                    <td className="py-3 px-3 font-semibold text-stone-200">Финская сауна</td>
                    <td className="py-3 px-3 font-mono text-rose-400">70 - 110°C</td>
                    <td className="py-3 px-3 font-mono text-amber-400">5 - 15% (сухая)</td>
                    <td className="py-3 px-3">Сухой жар. Потоотделение быстрое, но веники моментально пересыхают.</td>
                  </tr>
                  <tr className="hover:bg-stone-950/40">
                    <td className="py-3 px-3 font-semibold text-stone-200">Турецкий хаммам</td>
                    <td className="py-3 px-3 font-mono text-cyan-400">40 - 50°C</td>
                    <td className="py-3 px-3 font-mono text-cyan-400">до 100%</td>
                    <td className="py-3 px-3">Щадящий режим для сердечно-сосудистой системы, пилингов и мыльного массажа.</td>
                  </tr>
                  <tr className="hover:bg-stone-950/40">
                    <td className="py-3 px-3 font-semibold text-stone-200">Инфракрасная сауна</td>
                    <td className="py-3 px-3 font-mono text-stone-300">35 - 50°C</td>
                    <td className="py-3 px-3 font-mono text-stone-300">40 - 60%</td>
                    <td className="py-3 px-3">Прямой прогрев тканей электромагнитным излучением без пара.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-xl bg-stone-950 border border-amber-500/20 p-4 text-xs text-stone-300 leading-relaxed space-y-1">
              <strong className="text-amber-300 block">Правило точки росы для пармастера:</strong>
              Если парная перегрета выше 85-90°C при влажности свыше 60%, на коже гостя мгновенно возникает эффект «точки росы» с обильным жгучим конденсатом, вызывая болевой шок и термические травмы эпителия.
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Techniques */}
      {activeSection === 'techniques' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BROOM_TECHNIQUES.map((tech) => (
            <div key={tech.id} className="rounded-xl border border-stone-800 bg-stone-900/90 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-lg font-bold text-amber-200">{tech.name}</h4>
                <span className="text-[11px] px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-mono">
                  {tech.tempo}
                </span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">{tech.description}</p>
              <div className="text-xs pt-2 border-t border-stone-800/80 space-y-1">
                <div>
                  <span className="text-stone-400">Действие: </span>
                  <span className="text-stone-300">{tech.execution}</span>
                </div>
                <div>
                  <span className="text-stone-400">Анатомическая зона: </span>
                  <span className="text-amber-400/90 font-mono">{tech.zone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section 3: Herbs */}
      {activeSection === 'herbs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HERBS_DATA.map((herb) => (
            <div key={herb.id} className="rounded-xl border border-stone-800 bg-stone-900/90 p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{herb.icon}</span>
                <div>
                  <h4 className="font-semibold text-sm text-stone-100">{herb.name}</h4>
                  <p className="text-[11px] text-stone-500 italic">{herb.botanicalName}</p>
                </div>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">{herb.properties}</p>
              <div className="text-xs pt-2 border-t border-stone-800/80 text-stone-400">
                <strong className="text-stone-300">Применение:</strong> {herb.usage}
              </div>
              {herb.contraindicatedFor && (
                <div className="text-[11px] text-rose-400 font-mono pt-1">
                  ⚠️ {herb.contraindicatedFor}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Section 4: Safety & Contraindications */}
      {activeSection === 'safety' && (
        <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="font-serif text-xl font-bold text-stone-100 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-400" />
              <span>Медицинские Противопоказания для Гостя</span>
            </h3>
            <p className="text-xs text-stone-300">
              Категорически запрещено парение при любых острых состояниях. При сомнениях — отказ в процедуре.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <span>🔴</span>
                <span>Абсолютные Противопоказания (Табу)</span>
              </h4>
              <ul className="text-xs text-stone-300 space-y-1.5 list-disc pl-4">
                <li>Онкологические заболевания любой локализации</li>
                <li>Острые респираторные и инфекционные болезни с температурой тела {'>'} 37.0°C</li>
                <li>Тяжелая гипертония 3 степени, перенесенный инфаркт / инсульт в остром периоде</li>
                <li>Гнойные и открытые поражения кожного покрова, экзема в обострении</li>
                <li>Острые воспалительные процессы в организме</li>
                <li>Эпилепсия и тяжелые неврологические патологии</li>
              </ul>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>🟡</span>
                <span>Относительные (Только мягкая адаптация)</span>
              </h4>
              <ul className="text-xs text-stone-300 space-y-1.5 list-disc pl-4">
                <li>Беременность (только 2 триместр и только мягкий пар без душицы и контрастов)</li>
                <li>Онкологические и кожные заболевания в стадии стойкой ремиссии (строго с разрешения врача)</li>
                <li>Аллергическая восприимчивость к пыльце и травам</li>
                <li>Варикозное расширение вен (нижний полок, не парить ноги вениками в лоб)</li>
                <li>Гипотония (склонность к падению артериального давления)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Section 5: Master Health & Ergonomics */}
      {activeSection === 'health' && (
        <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-6 space-y-4">
          <h3 className="font-serif text-xl font-bold text-stone-100 flex items-center gap-2">
            <Heart className="h-5 w-5 text-emerald-400" />
            <span>Стандарт Защиты Здоровья Пармастера</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-stone-300">
            <div className="rounded-xl bg-stone-950 border border-stone-800 p-4 space-y-1.5">
              <strong className="text-amber-300 font-semibold block">1. Водно-солевой баланс:</strong>
              <p>Пейте не холодную воду, а теплые травяные чаи и минеральную воду. Восполняйте калий, магний и кальций (электролиты).</p>
            </div>
            <div className="rounded-xl bg-stone-950 border border-stone-800 p-4 space-y-1.5">
              <strong className="text-amber-300 font-semibold block">2. Экипировка мастера:</strong>
              <p>Обязателен плотный войлочный колпак для защиты сосудов мозга. Рашгард и банные штаны предотвращают перегрев кожи.</p>
            </div>
            <div className="rounded-xl bg-stone-950 border border-stone-800 p-4 space-y-1.5">
              <strong className="text-amber-300 font-semibold block">3. Восстановление и сон:</strong>
              <p>Сон перед сменой — не менее 8-9 часов. Не проводите более 4-5 сеансов в день, распределяйте нагрузки равномерно.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
