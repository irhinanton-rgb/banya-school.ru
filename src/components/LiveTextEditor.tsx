import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Edit3, Check, Copy, Trash2, RotateCcw, List, Eye, Sparkles, X, MousePointer } from 'lucide-react';

const OVERRIDES_STORAGE_KEY = 'banya_live_text_overrides_v1';

export const LiveTextEditor: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editButtonsToo, setEditButtonsToo] = useState<boolean>(false);
  const [showManagerModal, setShowManagerModal] = useState<boolean>(false);
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);

  // Strictly show ONLY inside AI Studio preview / local dev environment.
  // Never show on the production website (banya-school.ru, etc.).
  const isAiStudioPreview = typeof window !== 'undefined' && (
    window.location.hostname.startsWith('ais-dev-') ||
    window.location.hostname.startsWith('ais-pre-') ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );

  const [overrides, setOverrides] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem(OVERRIDES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {
      // ignore
    }
    return {};
  });

  const overridesRef = useRef<Record<string, string>>(overrides);
  useEffect(() => {
    overridesRef.current = overrides;
    try {
      localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
    } catch {
      // ignore
    }
  }, [overrides]);

  // Apply saved overrides to DOM text nodes & leaf elements
  const applyOverridesToDOM = useCallback(() => {
    const currentOverrides = overridesRef.current;
    const keys = Object.keys(currentOverrides);
    if (keys.length === 0) return;

    const root = document.getElementById('root');
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) => {
        const el = node as HTMLElement;
        if (el.id === 'live-text-editor-root' || el.closest('#live-text-editor-root')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let currentNode = walker.nextNode() as HTMLElement | null;
    while (currentNode) {
      // Avoid overwriting while user is actively typing inside this element
      if (document.activeElement !== currentNode) {
        const storedOrig = currentNode.getAttribute('data-orig-text');
        if (storedOrig && currentOverrides[storedOrig] !== undefined) {
          if (currentNode.innerText !== currentOverrides[storedOrig]) {
            currentNode.innerText = currentOverrides[storedOrig];
          }
        } else if (
          currentNode.children.length === 0 &&
          currentNode.textContent &&
          currentNode.textContent.trim().length > 0
        ) {
          const trimmed = currentNode.textContent.trim();
          if (currentOverrides[trimmed] !== undefined) {
            currentNode.setAttribute('data-orig-text', trimmed);
            if (currentNode.innerText !== currentOverrides[trimmed]) {
              currentNode.innerText = currentOverrides[trimmed];
            }
          }
        }
      }
      currentNode = walker.nextNode() as HTMLElement | null;
    }
  }, []);

  // MutationObserver to keep overrides applied when switching tabs, levels, or opening modals
  useEffect(() => {
    applyOverridesToDOM();
    const root = document.getElementById('root');
    if (!root) return;

    let rafId: number | null = null;
    const observer = new MutationObserver(() => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        applyOverridesToDOM();
      });
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [applyOverridesToDOM, overrides]);

  // Handle interactive inline editing when isEditMode === true
  useEffect(() => {
    if (!isEditMode) return;

    const EDITABLE_TAGS = new Set([
      'H1',
      'H2',
      'H3',
      'H4',
      'H5',
      'H6',
      'P',
      'SPAN',
      'LI',
      'BLOCKQUOTE',
      'LABEL',
      'TD',
      'TH',
      'STRONG',
      'EM',
      'B',
      'DIV',
      'BUTTON',
      'A',
    ]);

    const findEditableTarget = (target: HTMLElement | null): HTMLElement | null => {
      if (!target) return null;
      if (target.closest('#live-text-editor-root')) return null;

      // If user disabled button editing, let buttons/links work normally for navigation
      if (!editButtonsToo && (target.closest('button') || target.closest('a'))) {
        return null;
      }

      let el: HTMLElement | null = target;
      while (el && el !== document.body) {
        if (EDITABLE_TAGS.has(el.tagName)) {
          // Prefer leaf elements or elements with direct text nodes
          const hasDirectText = Array.from(el.childNodes).some(
            (n) => n.nodeType === Node.TEXT_NODE && (n.textContent || '').trim().length > 0
          );
          if (el.children.length === 0 || hasDirectText) {
            return el;
          }
        }
        el = el.parentElement;
      }
      return null;
    };

    let hoveredEl: HTMLElement | null = null;
    let activeEditEl: HTMLElement | null = null;

    const handleMouseOver = (e: MouseEvent) => {
      const candidate = findEditableTarget(e.target as HTMLElement);
      if (hoveredEl && hoveredEl !== candidate && hoveredEl !== activeEditEl) {
        hoveredEl.style.outline = '';
        hoveredEl.style.outlineOffset = '';
      }
      if (candidate && candidate !== activeEditEl) {
        hoveredEl = candidate;
        hoveredEl.style.outline = '1.5px dashed rgba(245, 158, 11, 0.75)';
        hoveredEl.style.outlineOffset = '3px';
        hoveredEl.style.cursor = 'text';
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const candidate = findEditableTarget(e.target as HTMLElement);
      if (candidate && candidate !== activeEditEl) {
        candidate.style.outline = '';
        candidate.style.outlineOffset = '';
      }
    };

    const saveElementEdit = (el: HTMLElement) => {
      const orig = el.getAttribute('data-orig-text');
      const newText = el.innerText.trim();
      el.contentEditable = 'false';
      el.style.outline = '';
      el.style.outlineOffset = '';
      el.style.backgroundColor = '';
      el.style.borderRadius = '';

      if (orig && newText && newText !== orig) {
        setOverrides((prev) => ({
          ...prev,
          [orig]: newText,
        }));
      } else if (orig && newText === orig) {
        setOverrides((prev) => {
          const next = { ...prev };
          delete next[orig];
          return next;
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      const candidate = findEditableTarget(e.target as HTMLElement);
      if (!candidate) return;

      e.preventDefault();
      e.stopPropagation();

      if (activeEditEl && activeEditEl !== candidate) {
        saveElementEdit(activeEditEl);
      }

      if (!candidate.getAttribute('data-orig-text')) {
        candidate.setAttribute('data-orig-text', candidate.innerText.trim());
      }

      activeEditEl = candidate;
      candidate.contentEditable = 'true';
      candidate.style.outline = '2px solid #f59e0b';
      candidate.style.outlineOffset = '4px';
      candidate.style.backgroundColor = 'rgba(245, 158, 11, 0.12)';
      candidate.style.borderRadius = '6px';
      candidate.focus();

      const onBlur = () => {
        saveElementEdit(candidate);
        if (activeEditEl === candidate) activeEditEl = null;
        candidate.removeEventListener('blur', onBlur);
        candidate.removeEventListener('keydown', onKeyDown);
      };

      const onKeyDown = (ke: KeyboardEvent) => {
        if (ke.key === 'Escape' || (ke.key === 'Enter' && !ke.shiftKey)) {
          ke.preventDefault();
          candidate.blur();
        }
      };

      candidate.addEventListener('blur', onBlur);
      candidate.addEventListener('keydown', onKeyDown);
    };

    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
      document.removeEventListener('click', handleClick, true);
      if (hoveredEl) {
        hoveredEl.style.outline = '';
        hoveredEl.style.outlineOffset = '';
      }
      if (activeEditEl) {
        saveElementEdit(activeEditEl);
      }
    };
  }, [isEditMode, editButtonsToo]);

  const overrideEntries = Object.entries(overrides);

  const handleCopyForAI = async () => {
    if (overrideEntries.length === 0) return;
    const lines = [
      'Внеси следующие текстовые правки в код проекта:',
      ...overrideEntries.map(
        ([orig, updated], idx) => `${idx + 1}. Было: «${orig}»\n   Стало: «${updated}»`
      ),
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n\n'));
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 3000);
    } catch {
      // ignore
    }
  };

  const handleRevertSingle = (origKey: string) => {
    // Restore in DOM immediately
    const root = document.getElementById('root');
    if (root) {
      const elements = root.querySelectorAll('[data-orig-text]');
      elements.forEach((el) => {
        if (el.getAttribute('data-orig-text') === origKey) {
          (el as HTMLElement).innerText = origKey;
        }
      });
    }
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[origKey];
      return next;
    });
  };

  const handleRevertAll = () => {
    const root = document.getElementById('root');
    if (root) {
      const elements = root.querySelectorAll('[data-orig-text]');
      elements.forEach((el) => {
        const orig = el.getAttribute('data-orig-text');
        if (orig) {
          (el as HTMLElement).innerText = orig;
        }
      });
    }
    setOverrides({});
  };

  if (!isAiStudioPreview) return null;

  return (
    <div id="live-text-editor-root" className="fixed bottom-20 md:bottom-5 left-4 z-[95] print:hidden font-sans">
      {/* Floating Control Pill */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-stone-950/95 border border-amber-500/40 shadow-2xl backdrop-blur-md">
        <button
          type="button"
          onClick={() => setIsEditMode((prev) => !prev)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isEditMode
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-lg shadow-amber-500/25'
              : 'bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-800'
          }`}
          title="Включить или выключить прямое редактирование текста кликом по странице"
        >
          {isEditMode ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Edit3 className="w-3.5 h-3.5" />}
          <span>{isEditMode ? 'Режим правки: ВКЛ' : 'Править текст'}</span>
        </button>

        {isEditMode && (
          <button
            type="button"
            onClick={() => setEditButtonsToo((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-semibold transition-all cursor-pointer border ${
              editButtonsToo
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
            title="Когда включено — клик по кнопкам редактирует их текст вместо перехода"
          >
            <MousePointer className="w-3 h-3" />
            <span>{editButtonsToo ? 'Кнопки: Текст' : 'Кнопки: Переход'}</span>
          </button>
        )}

        {overrideEntries.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setShowManagerModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 text-xs font-semibold transition-all cursor-pointer"
              title="Посмотреть все внесённые текстовые правки"
            >
              <List className="w-3.5 h-3.5 text-amber-400" />
              <span>Правок: {overrideEntries.length}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyForAI}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
              title="Скопировать список всех изменений, чтобы отправить в чат и закрепить в коде навсегда"
            >
              {copiedNotice ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedNotice ? 'Скопировано!' : 'Скопировать для кода'}</span>
            </button>
          </>
        )}
      </div>

      {/* Helper banner when edit mode is active */}
      {isEditMode && (
        <div className="mt-2 max-w-xs sm:max-w-sm rounded-xl bg-stone-950/95 border border-amber-500/30 px-3.5 py-2.5 text-[11px] text-stone-300 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Как редактировать:
            </span>
            <span className="text-[10px] font-mono text-stone-400">Enter / Esc — сохранить</span>
          </div>
          <p className="text-stone-400 leading-relaxed">
            Кликните на любой заголовок или абзац прямо на странице и введите новый текст. Все изменения мгновенно сохраняются.
          </p>
        </div>
      )}

      {/* Modal to review, edit, copy, or reset all saved text overrides */}
      {showManagerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-stone-950 border border-stone-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/60">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span>Внесённые правки текста ({overrideEntries.length})</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Эти изменения уже отображаются на сайте. Скопируйте их одним кликом, чтобы вшить в исходный код на GitHub.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowManagerModal(false)}
                className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {overrideEntries.length === 0 ? (
                <div className="text-center py-10 text-stone-500 text-sm">
                  Пока нет сохранённых текстовых правок.
                </div>
              ) : (
                overrideEntries.map(([orig, updated], idx) => (
                  <div
                    key={orig}
                    className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800/90 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                        Правка #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRevertSingle(orig)}
                        className="inline-flex items-center gap-1 text-[11px] text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Вернуть оригинал</span>
                      </button>
                    </div>

                    <div className="text-xs text-stone-500 bg-stone-950/70 p-2.5 rounded-xl border border-stone-800/60">
                      <span className="font-semibold text-stone-400 block mb-0.5">Было:</span>
                      <span className="line-through">{orig}</span>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-amber-300 block mb-1">Стало:</span>
                      <textarea
                        value={updated}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOverrides((prev) => ({
                            ...prev,
                            [orig]: val,
                          }));
                        }}
                        rows={2}
                        className="w-full rounded-xl bg-stone-950 border border-amber-500/40 px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-stone-800 bg-stone-900/60">
              <button
                type="button"
                onClick={handleRevertAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Сбросить все правки</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyForAI}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  {copiedNotice ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedNotice ? 'Скопировано в буфер!' : 'Скопировать все правки для ИИ'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
