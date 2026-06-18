import { useEffect, useRef } from "react";

const ACTIVITY_EVENTS = [
  "mousemove",
  "keydown",
  "click",
  "scroll",
  "touchstart",
];

export function useInactivityTimeout(
  onTimeout: () => void,
  timeoutMs: number,
  active: boolean,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active) return;

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(onTimeout, timeoutMs);
    };

    resetTimer();

    const handler = () => resetTimer();
    for (const ev of ACTIVITY_EVENTS) {
      document.addEventListener(ev, handler, { passive: true });
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const ev of ACTIVITY_EVENTS) {
        document.removeEventListener(ev, handler);
      }
    };
  }, [onTimeout, timeoutMs, active]);
}
