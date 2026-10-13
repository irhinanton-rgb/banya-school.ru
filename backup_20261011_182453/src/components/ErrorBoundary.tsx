import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Banya School caught error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('banya_quest_master_progress_v1');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl border border-stone-800 bg-stone-900 p-8 text-center space-y-6 shadow-2xl">
            <div className="text-4xl">🌿</div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-amber-200">
                Пармастер Квест
              </h2>
              <p className="text-sm text-stone-400">
                Произошла задержка при синхронизации состояния парной.
              </p>
              {this.state.error && (
                <div className="mt-3 p-3 rounded-lg bg-stone-950 border border-stone-800 text-left font-mono text-xs text-red-400 overflow-x-auto max-h-32">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 font-semibold text-stone-950 transition-colors shadow-lg shadow-amber-900/30"
            >
              Сбросить кэш и войти в баню
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
