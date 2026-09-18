"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

const HeroWeave = dynamic(() => import("./hero-weave"), { ssr: false });

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative flex min-h-[calc(100svh_-_var(--height-nav))] items-center justify-center overflow-hidden px-6 py-16 text-center sm:py-20">
      <HeroWeave />
      <div className="hero-veil pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex w-full max-w-[960px] flex-col items-center gap-6 sm:gap-8">
        <Reveal
          as="span"
          index={0}
          className="rounded-chip border border-line px-3 py-1 text-xs font-medium uppercase tracking-[.08em] text-muted"
        >
          {t("eyebrow")}
        </Reveal>

        <Reveal
          as="h1"
          index={1}
          className="max-w-[18ch] text-[clamp(2.25rem,5.6vw,5rem)] leading-[1.08] font-semibold -tracking-[.035em] text-balance text-fg"
        >
          {t("title")}
        </Reveal>

        <Reveal as="p" index={2} className="max-w-[55ch] text-[clamp(1.125rem,1.4vw,1.25rem)] leading-relaxed text-pretty text-muted">
          {t("description")}
        </Reveal>

        <Reveal
          as="div"
          index={3}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Button
            href="/#contact"
            variant="primary"
            analyticsEvent="cta_click"
            analyticsSection="hero"
          >
            {t("ctaPrimary")}
          </Button>
          <Button
            href="/#work"
            variant="secondary"
            analyticsEvent="cta_click"
            analyticsSection="hero"
          >
            {t("ctaSecondary")}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
