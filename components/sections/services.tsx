"use client";

﻿import { ArrowIcon } from "@/components/ui/arrow-icon";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ServiceIllustration } from "./service-illustration";
import { ServiceLink } from "./service-link";
import styles from "./showcase.module.css";

const PACKAGES = ["prototype", "custom", "team"] as const;
const DETAILS = ["receives", "objective", "format"] as const;

export function Services() {
  const t = useTranslations("Services");
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  function goTo(index: number) {
    const track = trackRef.current;
    const card = track?.children[index] as HTMLElement | undefined;
    if (!track || !card) return;
    track.scrollTo({ left: card.offsetLeft - (track.children[0] as HTMLElement).offsetLeft, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  function syncActive() {
    const track = trackRef.current;
    if (!track) return;
    const left = track.getBoundingClientRect().left;
    let nearest = 0;
    Array.from(track.children).forEach((card, index) => {
      if (Math.abs(card.getBoundingClientRect().left - left) < Math.abs(track.children[nearest].getBoundingClientRect().left - left)) nearest = index;
    });
    setActive(nearest);
  }
  return (
    <section id="services" aria-labelledby="services-title" className={`${styles.section} ${styles.servicesSection}`}>
      <div className={styles.wrap}>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <div data-section-enter="" className={styles.heading}>
          <h2 id="services-title">{t("title")}<br /><span>{t("titleAccent")}</span></h2>
          <p>{t("description")}</p>
        </div>
        <div className={styles.serviceNavigation}>
          <div className={styles.serviceSelectors} role="group" aria-label={t("navigation")}>
            {PACKAGES.map((key, index) => <button key={key} type="button" aria-pressed={active === index} aria-controls="services-track" onClick={() => goTo(index)}>{t(`packages.${key}.stage`)}</button>)}
          </div>
          <p role="status" aria-live="polite" aria-atomic="true">{t("position", { current: active + 1, total: PACKAGES.length })}</p>
        </div>
        <div data-section-enter="" ref={trackRef} id="services-track" className={styles.services} onScroll={syncActive} onFocusCapture={(event) => {
          if (!window.matchMedia("(max-width:760px)").matches) return;
          const card = (event.target as HTMLElement).closest("article");
          const index = Array.from(trackRef.current?.children ?? []).indexOf(card as Element);
          if (index >= 0) goTo(index);
        }}>
          {PACKAGES.map((key, index) => (
            <article key={key} className={styles.service}>
              <div className={styles.serviceNumber}><span>0{index + 1} / {t(`packages.${key}.stage`)}</span><span>{t(`packages.${key}.duration`)}</span></div>
              <h3>{t(`packages.${key}.intent`)}</h3>
              <p className={styles.serviceName}>{t(`packages.${key}.name`)}</p>
              <ServiceIllustration index={index} />
              <dl className={styles.serviceDetails}>
                {DETAILS.map(detail => <div key={detail}><dt>{t(`details.${detail}`)}</dt><dd>{t(`packages.${key}.${detail}`)}</dd></div>)}
              </dl>
              <div className={styles.priceArea}>
                <p className="text-lg font-semibold text-fg">{t(`packages.${key}.price`)}</p>
                <p className={styles.cadence}>USD · {t(`packages.${key}.cadence`)}</p>
                <ServiceLink service={key} className={styles.serviceCta}>{t(`packages.${key}.cta`)}<span aria-hidden="true"><ArrowIcon /></span></ServiceLink>
              </div>
            </article>
          ))}
        </div>
        <div data-section-enter="" className={styles.servicesNote}><span>{t("scopeNote")}</span><ServiceLink service="unsure">{t("helpCta")} <ArrowIcon /></ServiceLink></div>
      </div>
    </section>
  );
}
