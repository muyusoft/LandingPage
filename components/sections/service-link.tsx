"use client";

import type { ReactNode, MouseEvent } from "react";
import { selectService, type ServiceKey } from "@/lib/service-selection";
import { trackEvent } from "@/lib/analytics";

export function ServiceLink({ service, className, children }: {
  service: ServiceKey;
  className?: string;
  children: ReactNode;
}) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    selectService(service, true);
    trackEvent("cta_click", { section: "services", service });
    const contact = document.getElementById("contact");
    contact?.focus({ preventScroll: true });
    contact?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      block: "start",
    });
  }

  return <a href={`?service=${service}#contact`} className={className} onClick={handleClick}>{children}</a>;
}
