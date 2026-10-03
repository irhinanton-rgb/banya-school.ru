import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

function initApp() {
  const container = document.getElementById('root');
  if (!container) {
    setTimeout(initApp, 50);
    return;
  }
  try {
    const root = createRoot(container);
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } catch (err) {
    console.error('Fatal initialization error:', err);
    container.innerHTML = `
      <div style="min-height: 100vh; background-color: #0c0a09; display: flex; align-items: center; justify-content: center; color: #d6d3d1; font-family: sans-serif; text-align: center; padding: 20px;">
        <div>
          <div style="font-size: 36px; margin-bottom: 12px;">🌿</div>
          <div style="font-size: 20px; color: #f59e0b; margin-bottom: 8px; font-weight: 600;">Квест Пармастера</div>
          <div style="font-size: 14px; color: #9ca3af; margin-bottom: 20px;">Нажмите кнопку, чтобы загрузить интерфейс:</div>
          <button onclick="localStorage.clear(); window.location.reload();" style="padding: 12px 24px; background-color: #d97706; color: black; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px;">
            Войти в Академию
          </button>
        </div>
      </div>
    `;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}


