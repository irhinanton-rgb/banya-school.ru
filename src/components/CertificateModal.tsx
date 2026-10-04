import React, { useState } from 'react';
import { Printer, X } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onUpdateName: (name: string) => void;
  certifiedDate: string;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  userName,
  onUpdateName,
  certifiedDate,
}) => {
  const [nameInput, setNameInput] = useState<string>(userName || 'Александр Мастеров');
  const [isEditing, setIsEditing] = useState<boolean>(!userName);

  if (!isOpen) return null;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = nameInput.trim().slice(0, 50);
    if (clean) {
      setNameInput(clean);
      onUpdateName(clean);
      setIsEditing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-stone-800 bg-stone-900 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Modal Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4 print:hidden">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-100">
                Именной Сертификат Пармастера
              </h3>
              <p className="text-xs text-stone-400">
                Официальный документ о прохождении курса «Квест Пармастера: Путь к Мастерству»
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              <Printer className="h-4 w-4" />
              <span>Распечатать / Сохранить в PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Name input form if editing */}
        {isEditing ? (
          <form onSubmit={handleSaveName} className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex flex-col sm:flex-row items-center gap-3 print:hidden">
            <label htmlFor="student-name-input" className="text-xs text-stone-300 font-medium whitespace-nowrap">
              Ваше ФИО для сертификата:
            </label>
            <input
              id="student-name-input"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Иван Смирнов"
              className="flex-1 w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-colors cursor-pointer"
            >
              Сохранить ФИО
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between text-xs text-stone-400 print:hidden px-2">
            <span>Выдан на имя: <strong className="text-amber-300">{nameInput}</strong></span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Изменить имя
            </button>
          </div>
        )}

        {/* Printable Certificate Canvas */}
        <div
          id="certificate-print-area"
          className="relative overflow-hidden rounded-2xl border-4 border-amber-600/60 bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/40 p-8 sm:p-12 text-stone-100 shadow-2xl flex flex-col items-center justify-between text-center min-h-[500px] select-none"
        >
          {/* Ornate corner frames */}
          <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-amber-500/80 pointer-events-none" />
          <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-amber-500/80 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-amber-500/80 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-amber-500/80 pointer-events-none" />

          {/* Inner decorative border */}
          <div className="absolute inset-4 rounded-xl border border-amber-500/20 pointer-events-none" />

          {/* Certificate Header */}
          <div className="space-y-3 z-10 pt-2">
            <div className="flex items-center justify-center gap-2 text-amber-400 text-xs uppercase tracking-[0.25em] font-mono">
              <span>✦</span>
              <span>ГИЛЬДИЯ БАННОГО ИСКУССТВА</span>
              <span>✦</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-wide text-amber-100 uppercase">
              Сертификат Пармастера
            </h2>

            <p className="text-xs sm:text-sm text-stone-400 max-w-lg mx-auto font-sans tracking-wide">
              Настоящим удостоверяется, что обладатель данного сертификата успешно прошел полный интерактивный курс практического и теоретического мастерства
            </p>
          </div>

          {/* Recipient Name */}
          <div className="my-8 z-10 space-y-2">
            <div className="text-xs text-amber-400/80 font-mono tracking-widest uppercase">
              Присваивается звание Мастера Парения:
            </div>
            <div className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-300 border-b-2 border-amber-500/40 pb-2 px-8 inline-block">
              {nameInput}
            </div>
          </div>

          {/* Competencies Certified */}
          <div className="z-10 max-w-2xl text-xs sm:text-sm text-stone-300 leading-relaxed space-y-3">
            <p>
              Подтверждено владение ключевыми компетенциями: <strong>Церемония первого пара</strong> (бесконтактный прогрев и физиология потоотделения), <strong>8 приёмов венечного массажа</strong> (опахивание, припарка, малый контакт, единичка, двойка с перехлёстом), <strong>фито- и ароматерапия</strong>, <strong>диагностика противопоказаний</strong> и <strong>протоколы безопасности</strong>.
            </p>
          </div>

          {/* Footer Seals & Signatures */}
          <div className="mt-8 z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-amber-500/20 pt-6">
            <div className="text-left space-y-1">
              <div className="text-[11px] text-stone-400 font-mono">ДАТА АТТЕСТАЦИИ:</div>
              <div className="text-sm font-semibold text-amber-200">{certifiedDate}</div>
              <div className="text-[10px] text-stone-500 font-mono">ID: BM-QUEST-2026-X77</div>
            </div>

            {/* Seal Graphic */}
            <div className="relative flex items-center justify-center">
              <div className="h-20 w-20 rounded-full border-2 border-amber-500/80 bg-gradient-to-br from-amber-500/20 via-stone-900 to-amber-700/30 shadow-lg flex items-center justify-center">
                <svg viewBox="0 0 80 80" className="h-16 w-16 text-amber-400" aria-hidden="true">
                  <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
                  <circle cx="40" cy="40" r="28" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                  <text x="40" y="46" textAnchor="middle" fontSize="24">👑</text>
                </svg>
              </div>
              <span className="absolute -bottom-2 text-[10px] font-mono text-amber-400 font-bold bg-stone-950/90 px-2 py-0.5 rounded border border-amber-500/40">
                АТТЕСТОВАН
              </span>
            </div>

            <div className="text-right space-y-1">
              <div className="text-[11px] text-stone-400 font-mono">СТАТУС КВАЛИФИКАЦИИ:</div>
              <div className="text-sm font-bold text-emerald-400 font-mono">АККРЕДИТОВАН ✦</div>
              <div className="text-[10px] text-stone-500">Квест Пармастера · 100%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
