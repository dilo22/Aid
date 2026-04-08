import { useEffect, useRef, useCallback } from "react";

const IDLE_TIMEOUT_MS  = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_MS = 2 * 60 * 1000;  // avertissement 2 min avant
const EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];

export const useIdleTimeout = (onTimeout) => {
  const timerRef   = useRef(null);
  const warningRef = useRef(null);
  const toastRef   = useRef(null);

  const removeToast = () => {
    if (toastRef.current) {
      toastRef.current.remove();
      toastRef.current = null;
    }
  };

  const showWarning = useCallback(() => {
    removeToast();

    const toast = document.createElement("div");
    toast.setAttribute("role", "alert");
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      background: #1e293b;
      color: #f8fafc;
      padding: 16px 20px;
      border-radius: 14px;
      font-size: 14px;
      font-family: sans-serif;
      box-shadow: 0 8px 30px rgba(0,0,0,0.25);
      display: grid;
      gap: 12px;
      min-width: 280px;
      border-left: 4px solid #f59e0b;
    `;

    toast.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:18px">⚠️</span>
        <div>
          <div style="font-weight:700;margin-bottom:4px">Session inactive</div>
          <div style="color:#94a3b8;font-size:13px">Vous serez déconnecté dans 2 minutes.</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button id="idle-stay" style="
          padding:8px 14px;border-radius:8px;border:none;
          background:#2563eb;color:#fff;font-weight:700;
          font-size:13px;cursor:pointer;
        ">Rester connecté</button>
      </div>
    `;

    document.body.appendChild(toast);
    toastRef.current = toast;

    document.getElementById("idle-stay")?.addEventListener("click", () => {
      removeToast();
      resetTimer();
    });
  }, []);

  const resetTimer = useCallback(() => {
    removeToast();
    if (timerRef.current)   clearTimeout(timerRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    warningRef.current = setTimeout(showWarning,  IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);
    timerRef.current   = setTimeout(() => {
      removeToast();
      onTimeout();
    }, IDLE_TIMEOUT_MS);
  }, [onTimeout, showWarning]);

  useEffect(() => {
    resetTimer();
    EVENTS.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    return () => {
      removeToast();
      if (timerRef.current)   clearTimeout(timerRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      EVENTS.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [resetTimer]);
};