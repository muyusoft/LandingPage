"use client";

import { useTranslations } from "next-intl";
import { useRef, useState, useSyncExternalStore } from "react";
import { StartArtifact } from "./start-artifact";
import styles from "./start-contact.module.css";

const STEPS = ["one", "two", "three", "four"] as const;
const MOBILE_QUERY = "(max-width:760px)";

function subscribeMobile(callback: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

// En móvil el detalle vive dentro del paso seleccionado (acordeón); en
// escritorio sigue siendo el panel compartido junto a la línea de tiempo.
function useIsMobile() {
  return useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}

export function HowWeStart() {
  const t = useTranslations("HowWeStart");
  const [active, setActive] = useState(0);
  const isMobile = useIsMobile();
  const panelRef = useRef<HTMLDivElement>(null);
  const key = STEPS[active];

  function activate(index: number) {
    setActive(index);
    if (!isMobile) return;
    requestAnimationFrame(() => {
      panelRef.current?.focus({ preventScroll: true });
      panelRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        block: "nearest",
      });
    });
  }

  const detail = (
    <section ref={panelRef} id="start-detail" data-section-enter="" className={styles.detailPanel} aria-labelledby="start-detail-title" tabIndex={-1}>
      <div className={styles.detailCopy} aria-live="polite" aria-atomic="true">
        <p className={styles.detailKicker}>0{active + 1} / {t(`steps.${key}.kicker`)}</p>
        <h3 id="start-detail-title">{t(`steps.${key}.detailTitle`)}</h3>
        <p>{t(`steps.${key}.detailDescription`)}</p>
        <div className={styles.detailBottom}><i aria-hidden="true" /><span>{t(`steps.${key}.note`)}</span></div>
      </div>
      <div className={styles.artifactArea}><StartArtifact key={key} index={active} /></div>
    </section>
  );

  return (
    <section id="how-we-start" aria-labelledby="start-title" className={styles.section}>
      <div className={styles.wrap}>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <div data-section-enter="" className={styles.heading}>
          <h2 id="start-title">{t("title")}<br /><span>{t("titleAccent")}</span></h2>
          <p>{t("description")}</p>
        </div>
        <ol data-section-enter="" className={styles.timeline}>
          {STEPS.map((step, index) => (
            <li key={step} className={styles.milestone}>
              <button type="button" className={styles.stepButton} aria-pressed={active === index} aria-controls="start-detail" onClick={() => activate(index)}>
                <span className={styles.node} aria-hidden="true">0{index + 1}</span>
                <span className={styles.day}>{t(`steps.${step}.label`)}</span>
                <span className={styles.deliverableTag}>{t(`steps.${step}.action`)}</span>
              </button>
              <h3>{t(`steps.${step}.title`)}</h3>
              <p>{t(`steps.${step}.description`)}</p>
              {isMobile && active === index && detail}
            </li>
          ))}
        </ol>
        {!isMobile && detail}
        <div className={styles.processFoot}>
          <p>{t("timelineNote")}</p>
          <a className={styles.textLink} href="#contact">{t("cta")} <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>
  );
}
