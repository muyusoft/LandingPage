type EventProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: EventProps }) => void;
  }
}

export function trackEvent(eventName: string, props?: EventProps) {
  if (typeof window === "undefined") return;
  window.plausible?.(eventName, props ? { props } : undefined);
}
