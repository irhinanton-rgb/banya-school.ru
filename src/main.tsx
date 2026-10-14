import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { AuthProvider } from "./firebase/AuthContext.tsx";
import "./index.css";

let isMounted = false;

function initApp() {
  if (isMounted) return;
  const container = document.getElementById("root");
  if (!container) return;
  isMounted = true;

  try {
    // We do NOT wipe container.innerHTML = "" to avoid sudden black screens.
    const root = createRoot(container);
    root.render(
      <ErrorBoundary>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ErrorBoundary>
    );
  } catch (err: any) {
    console.error("Fatal initialization error:", err);
    if (container) {
      container.innerHTML = `
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0c0a09;color:#f5f5f4;font-family:sans-serif;padding:20px;text-align:center;">
          <div style="max-width:480px;background:#1c1917;border:1px solid #7f1d1d;border-radius:16px;padding:32px;">
            <div style="font-size:36px;margin-bottom:12px;">🌿</div>
            <h2 style="font-size:20px;color:#fca5a5;margin:0 0 12px 0;">Ошибка запуска приложения</h2>
            <p style="font-size:14px;color:#a8a29e;margin:0 0 16px 0;">${err?.message || "Не удалось запустить интерактивную парную"}</p>
            <button onclick="window.location.reload(true)" style="background:#ea580c;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:600;">Перезагрузить страницу</button>
          </div>
        </div>
      `;
    }
  }
}

if (document.getElementById("root")) {
  initApp();
} else {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp, { once: true });
  }
  window.addEventListener("load", initApp, { once: true });
  setTimeout(initApp, 50);
}
