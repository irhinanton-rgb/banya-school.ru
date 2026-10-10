import React from 'react';
import { Wind, X, CheckCircle2, ShieldCheck, Info, Sparkles, ArrowRight, Droplets } from 'lucide-react';
import { playWindSound } from '../../utils/audio';

interface VentilationEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVentilate: () => void;
  isVentilating: boolean;
  soundEnabled: boolean;
}

export const VentilationEducationModal: React.FC<VentilationEducationModalProps> = ({
  isOpen,
  onClose,
  onVentilate,
  isVentilating,
  soundEnabled,
}) => {
  if (!isOpen) return null;

  const handleApplyVentilation = () => {
    playWindSound(soundEnabled);
    onVentilate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl border border-cyan-500/40 bg-stone-950 text-stone-100 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Top Header */}
        <div className="relative bg-gradient-to-r from-cyan-950/90 via-stone-900 to-cyan-950/90 border-b border-stone-800 p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center text-2xl shadow-inner">
              <Wind className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <span>Кислородный режим & Физиология</span>
                <span className="text-stone-500">•</span>
                <span className="text-stone-300">Академия Пармастера</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-100">
                Важность Проветривания Парной
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-stone-100 flex items-center justify-center transition-colors border border-stone-800 cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-stone-200 text-sm leading-relaxed">
          {/* Main takeaway highlight */}
          <div className="rounded-2xl bg-gradient-to-r from-cyan-950/40 via-stone-900 to-cyan-950/40 border border-cyan-500/40 p-4 sm:p-5 flex items-start gap-3.5 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-base text-cyan-200">
                Золотое правило пармастера:
              </h4>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Главный враг гостя в русской бане — <strong className="text-cyan-300">не высокая температура, а гипоксия</strong> (острая нехватка кислорода) и избыток углекислого газа CO₂. Без постоянного кислородного притока баня превращается в душегубку.
              </p>
            </div>
          </div>

          {/* 3 Phases Detailed Breakdown */}
          <div className="space-y-3.5">
            <h4 className="font-serif text-base font-bold text-stone-100 flex items-center gap-2">
              <span>🌬️</span>
              <span>Три обязательных этапа проветривания:</span>
            </h4>

            {/* Stage 1: Before */}
            <div className="rounded-2xl bg-stone-900/80 border border-stone-800 p-4 sm:p-5 space-y-2 hover:border-cyan-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-amber-300 text-sm sm:text-base flex items-center gap-2">
                  <span>🚪</span>
                  <span>1. До процедур (Перед парением):</span>
                </span>
                <span className="text-[11px] font-mono text-amber-400/90 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  Перед каждым заходом
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Пока парная топилась или простаивала, воздух застаивается, кислород выгорает. Перед заходом гостя парная проветривается залпом: окно и дверь открываются настежь на 2–3 минуты, наполняя помещение свежим воздухом с 21% O₂. Парение без свежего воздуха провоцирует резкий сосудистый спазм, пульсацию в висках и тошноту.
              </p>
            </div>

            {/* Stage 2: During */}
            <div className="rounded-2xl bg-stone-900/80 border border-stone-800 p-4 sm:p-5 space-y-2 hover:border-cyan-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-cyan-300 text-sm sm:text-base flex items-center gap-2">
                  <span>🌿</span>
                  <span>2. Во время процедур (В процессе парения):</span>
                </span>
                <span className="text-[11px] font-mono text-cyan-400/90 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                  Система «Второе Дыхание»
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Микроприток свежего воздуха под голову гостя (форточка под полком или деревянный воздуховод с уличным воздухом, прикрытый прохладным пихтовым веником). Тело гостя принимает мощный паровой прогрев (60°C), а лицо дышит легким морозным уличным кислородом. Пульс остается спокойным, голова светлой, а время комфортного парения увеличивается вдвое без нагрузки на сердце.
              </p>
            </div>

            {/* Stage 3: After */}
            <div className="rounded-2xl bg-stone-900/80 border border-stone-800 p-4 sm:p-5 space-y-2 hover:border-cyan-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-emerald-300 text-sm sm:text-base flex items-center gap-2">
                  <span>💨</span>
                  <span>3. После процедур (Залповый сброс и просушка):</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-400/90 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  После выхода гостей
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Отработанный пар насыщен токсинами, испарениями пота и углекислым газом. Окно и дверь распахиваются настежь на 2–3 минуты для полного сброса отработанной массы. Затем окна закрывают: мощное аккумулированное тепло печи высушивает древесину полок и стен до звона, полностью предотвращая появление плесени, грибка и гниения.
              </p>
            </div>
          </div>

          {/* Physiological facts grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1">
              <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-amber-400" />
                <span>«Правило 120»</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-normal">
                Сумма градусов и влажности: 60°C + 60% = 120. Если влажность растет выше, залповое проветривание быстро нормализует баланс.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-1">
              <div className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Защита парной</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-normal">
                Липа, кедр и осина служат десятилетиями без потемнения, если после каждого парения влажный воздух полностью замещается сухим.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-stone-950 border-t border-stone-800 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-mono text-stone-400 text-center sm:text-left">
            <span>Эффект симулятора: </span>
            <span className="text-cyan-300 font-bold">-15% влажности · -8°C температуры</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleApplyVentilation}
              disabled={isVentilating}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 active:scale-95 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
            >
              <Wind className="w-4 h-4 text-stone-950" />
              <span>{isVentilating ? 'Проветриваем...' : 'Запустить залповое проветривание'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold transition-colors cursor-pointer border border-stone-800"
            >
              Понятно, закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
