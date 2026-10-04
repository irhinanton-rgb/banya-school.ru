import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

let isMounted = false;

function initApp() {
  if (isMounted) return;
  const container = document.getElementById('root');
  if (!container) {
    return;
  }
  isMounted = true;

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
      <div style="min-height: 100vh; background-color: #0c0a09; display: flex; align-items: center; justify-content: center; color: #d6d3d1; font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 20px;">
        <div style="max-width: 420px; border: 1px solid #292524; background: #1c1917; padding: 32px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
          <div style="font-size: 40px; margin-bottom: 12px;">🌿</div>
          <div style="font-size: 22px; color: #f59e0b; margin-bottom: 8px; font-weight: 700; font-family: serif;">Квест Пармастера</div>
          <div style="font-size: 14px; color: #a8a29e; margin-bottom: 24px; line-height: 1.5;">Нажмите кнопку ниже для безопасной загрузки Академии:</div>
          <button onclick="try{localStorage.clear();}catch(e){} window.location.reload();" style="width: 100%; padding: 14px 24px; background-color: #d97706; color: #0c0a09; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 15px;">
            Войти в Академию Банного Мастерства
          </button>
        </div>
      </div>
    `;
  }
}

// 1. Mount immediately if root element already exists
if (document.getElementById('root')) {
  initApp();
} else {
  // 2. Otherwise listen for DOM readiness with fallbacks
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp, { once: true });
  }
  window.addEventListener('load', initApp, { once: true });
  setTimeout(initApp, 50);
}



