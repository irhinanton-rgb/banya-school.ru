import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { AuthProvider } from './firebase/AuthContext.tsx';
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
    container.innerHTML = '';
    const root = createRoot(container);
    root.render(
      <ErrorBoundary>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ErrorBoundary>
    );
  } catch (err) {
    console.error('Fatal initialization error:', err);
  }
}

if (document.getElementById('root')) {
  initApp();
} else {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp, { once: true });
  }
  window.addEventListener('load', initApp, { once: true });
  setTimeout(initApp, 50);
}
