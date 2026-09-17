"use client";

import type { ComponentProps, MouseEvent } from "react";
import { trackEvent } from "@/lib/analytics";
import { Link } from "@/lib/i18n";

type Variant = "primary" | "secondary";

const baseClasses =
  "inline-flex h-11 items-center justify-center rounded-btn px-5 text-sm font-semibold tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent-2 text-bg hover:bg-accent-2/90",
  secondary: "border border-line-2 text-fg hover:bg-surface",
};

type ButtonProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  /** Nombre del evento de analítica a disparar en el clic (sección 9 del spec). */
  analyticsEvent?: string;
  analyticsSection?: string;
};

export function Button({
  variant = "primary",
  className = "",
  analyticsEvent,
  analyticsSection,
  onClick,
  ...props
}: ButtonProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (analyticsEvent) {
      trackEvent(analyticsEvent, analyticsSection ? { section: analyticsSection } : undefined);
    }
    onClick?.(event);
  }

  return (
    <Link
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={handleClick}
      {...props}
    />
  );
}
