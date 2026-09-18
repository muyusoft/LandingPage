"use client";

import { ExpandingPanel } from "@/components/ui/expanding-panel";
import { useAccordionAnchor } from "@/hooks/use-accordion-anchor";
import { ArrowIcon } from "@/components/ui/arrow-icon";
import { useTranslations } from "next-intl";
import { useState, useSyncExternalStore } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(true);
  const anchor = useAccordionAnchor();

  function activate(index: number, button: HTMLButtonElement) {
    if (isMobile) {
      anchor(button);
      setMobileOpen(active === index ? !mobileOpen : true);
    }
    setActive(index);
  }

  function detail(index: number, desktop = false) {
    const key = STEPS[index];
    return (
      <div id={desktop ? "start-detail" : undefined} className={styles.detailPanel}>
        <div className={styles.detailCopy}>
          <p className={styles.detailKicker}>0{index + 1} / {t(`steps.${key}.kicker`)}</p>
          <h3>{t(`steps.${key}.detailTitle`)}</h3>
          <p>{t(`steps.${key}.detailDescription`)}</p>
          <div className={styles.detailBottom}><i aria-hidden="true" /><span>{t(`steps.${key}.note`)}</span></div>
        </div>
        <div className={styles.artifactArea}><StartArtifact index={index} /></div>
      </div>
    );
  }

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
              <button id={`start-step-${index}`} type="button" className={styles.stepButton} aria-pressed={!isMobile ? active === index : undefined} aria-expanded={isMobile ? active === index && mobileOpen : undefined} aria-controls={isMobile ? `start-panel-${index}` : "start-detail"} onClick={(event) => activate(index, event.currentTarget)}>
                <span className={styles.node} aria-hidden="true">0{index + 1}</span>
                <span className={styles.day}>{t(`steps.${step}.label`)}</span>
                {isMobile ? <span className={styles.mobileStepTitle}>{t(`steps.${step}.title`)}<span aria-hidden="true">{active === index && mobileOpen ? "−" : "+"}</span></span> : <span className={styles.deliverableTag}>{t(`steps.${step}.action`)}</span>}
              </button>
              {!isMobile && <h3>{t(`steps.${step}.title`)}</h3>}
              <p>{t(`steps.${step}.description`)}</p>
              {isMobile && <ExpandingPanel className={styles.mobileExpansion} id={`start-panel-${index}`} labelledBy={`start-step-${index}`} open={active === index && mobileOpen}>{detail(index)}</ExpandingPanel>}
            </li>
          ))}
        </ol>
        {!isMobile && detail(active, true)}
        <div className={styles.processFoot}>
          <p>{t("timelineNote")}</p>
          <a className={styles.textLink} href="#contact">{t("cta")} <span aria-hidden="true"><ArrowIcon /></span></a>
        </div>
      </div>
    </section>
  );
}
