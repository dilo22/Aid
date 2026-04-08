import { useEffect, useRef, useCallback } from "react";

const IDLE_TIMEOUT_MS = 1 * 60 * 1000; // 30 minutes
const EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];

export const useIdleTimeout = (onTimeout) => {
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onTimeout, IDLE_TIMEOUT_MS);
  }, [onTimeout]);

  useEffect(() => {
    resetTimer();
    EVENTS.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      EVENTS.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [resetTimer]);
};