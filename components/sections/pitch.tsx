"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { PitchScene } from "./pitch-scene";
import styles from "./pitch.module.css";

const STEP_KEYS = ["one", "two", "three", "four"] as const;

export function Pitch() {
  const t = useTranslations("Pitch");
  const [activeIndex, setActiveIndex] = useState(0);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = stepsRef.current;
    if (!container) return;
    const steps = Array.from(container.children);
    // El panel sticky solo tiene sentido con ancho Y alto suficientes.
    const desktop = window.matchMedia("(min-width: 980px) and (min-height: 640px)");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!desktop.matches) return;
      const focus = window.innerHeight * 0.48;
      let nearest = 0;
      let distance = Infinity;
      steps.forEach((step, index) => {
        const rect = step.getBoundingClientRect();
        const delta = Math.abs(rect.top + rect.height / 2 - focus);
        if (delta < distance) { distance = delta; nearest = index; }
      });
      setActiveIndex(nearest);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(container);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <section id="pitch" aria-labelledby="pitch-title" className={styles.pitch}>
      <div data-section-enter="" className={styles.intro}>
        <div><p className={styles.eyebrow}>{t("eyebrow")}</p><h2 id="pitch-title">{t("title")}</h2></div>
        <p className={styles.description}>{t("description")}</p>
      </div>
      <div className={styles.story}>
        <div className={styles.stage}>
          <div data-section-enter="" className={styles.window}>
            <div className={styles.chrome}>
              <span className={styles.dots} aria-hidden="true"><i /><i /><i /></span>
              <span className={styles.workspace}>muyusoft / workspace</span>
              <span className={styles.status}>{t("visual.illustrative")}</span>
            </div>
            <div className={styles.canvas}><div key={activeIndex} className={styles.scene}><PitchScene index={activeIndex} /></div></div>
            <div className={styles.windowFooter}><span>{t(`steps.${STEP_KEYS[activeIndex]}.caption`)}</span><span>{t("visual.demo")}</span></div>
          </div>
          <nav className={styles.progress} aria-label={t("visual.navigation")}>
            {STEP_KEYS.map((key, index) => (
              <a key={key} href={`#pitch-step-${index + 1}`} aria-current={index === activeIndex ? "step" : undefined}>
                <span>0{index + 1}</span>{t(`steps.${key}.label`)}
              </a>
            ))}
          </nav>
          <div className={styles.hint}><span>{t("visual.continuity")}</span><span>{t("visual.scroll")} <span aria-hidden="true">↓</span></span></div>
        </div>
        <div ref={stepsRef}>
          {STEP_KEYS.map((key, index) => (
            <article key={key} id={`pitch-step-${index + 1}`} className={styles.step} data-active={index === activeIndex} aria-labelledby={`pitch-heading-${index + 1}`}>
              <div className={styles.stepNumber}>0{index + 1} / {t(`steps.${key}.label`)}</div>
              <h3 id={`pitch-heading-${index + 1}`}>{t(`steps.${key}.title`)}</h3>
              <p>{t(`steps.${key}.description`)}</p>
              <div className={styles.outcome}>{t(`steps.${key}.outcome`)}</div>
              <div className={`${styles.mobileVisual} ${styles.window}`}>
                <div className={styles.canvas}><PitchScene index={index} /></div>
                <div className={styles.windowFooter}><span>{t("visual.illustrative")}</span><span>{t("visual.demo")}</span></div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
