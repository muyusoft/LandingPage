"use client";

import { useEffect, useRef } from "react";

/** Keep the selected heading in place as a preceding panel collapses. */
export function useAccordionAnchor() {
  const frame = useRef(0);
  useEffect(() => {
    const stop = () => cancelAnimationFrame(frame.current);
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("keydown", stop);
    return () => {
      stop();
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("keydown", stop);
    };
  }, []);
  return (button: HTMLButtonElement) => {
    cancelAnimationFrame(frame.current);
    const top = Math.max(88, Math.min(button.getBoundingClientRect().top, window.innerHeight - 100));
    const end = performance.now() + 460;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function update() {
      if (!button.isConnected || !button.getClientRects().length) return;
      const delta = button.getBoundingClientRect().top - top;
      if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: "instant" });
      if (!reduced && performance.now() < end) frame.current = requestAnimationFrame(update);
    }
    frame.current = requestAnimationFrame(update);
  };
}
