"use client";

import { ArrowIcon } from "@/components/ui/arrow-icon";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import styles from "./showcase.module.css";

export function WorkCarousel({ children, labels }: { children: ReactNode[]; labels: string[] }) {
  const t = useTranslations("Work");
  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let timer: ReturnType<typeof setTimeout>;
    let frame = 0;
    function sync() {
      if (!track) return;
      const left = track.getBoundingClientRect().left;
      let nearest = 0;
      let distance = Infinity;
      Array.from(track.children).forEach((slide, index) => {
        const delta = Math.abs(slide.getBoundingClientRect().left - left);
        if (delta < distance) { distance = delta; nearest = index; }
      });
      activeRef.current = nearest;
      setActive(nearest);
    }
    function schedule() {
      clearTimeout(timer);
      timer = setTimeout(sync, 100);
    }
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const slide = track.children[activeRef.current] as HTMLElement;
        if (slide) track.scrollTo({ left: slide.offsetLeft, behavior: "instant" });
        sync();
      });
    });
    observer.observe(track);
    track.addEventListener("scroll", schedule, { passive: true });
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      observer.disconnect();
      track.removeEventListener("scroll", schedule);
    };
  }, []);

  function goTo(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const target = Math.max(0, Math.min(children.length - 1, index));
    const slide = track.children[target] as HTMLElement;
    if (!slide) return;
    // Set the target immediately so rapid clicks advance predictably.
    activeRef.current = target;
    track.scrollTo({
      left: slide.offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  return (
    <div data-section-enter="" className={styles.projectCarousel} role="region" aria-roledescription={t("carouselRole")} aria-label={t("carousel")}>
      <div
        ref={trackRef}
        id="work-track"
        className={styles.cases}
        tabIndex={0}
        aria-label={t("trackLabel")}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            goTo(activeRef.current + (event.key === "ArrowRight" ? 1 : -1));
          }
        }}
      >
        {children.map((child, index) => (
          <div key={labels[index]} className={styles.slide} role="group" aria-roledescription={t("slideRole")} aria-label={`${t("position", { current: index + 1, total: children.length })}: ${labels[index]}`} inert={index !== active}>
            {child}
          </div>
        ))}
      </div>
      {children.length > 1 && <div className={styles.carouselControls}>
        <div className={styles.carouselStatus}>
          <span role="status" aria-live="polite" aria-atomic="true" aria-label={t("position", { current: active + 1, total: children.length })}>{String(active + 1).padStart(2, "0")} / {String(children.length).padStart(2, "0")}</span>
          <span className={styles.carouselHint}>{t("hint")}</span>
        </div>
        <div className={styles.carouselActions}>
          <div className={styles.carouselDots} role="group" aria-label={t("choose")}>
            {labels.map((label, index) => <button key={label} type="button" className={styles.carouselDot} onClick={() => goTo(index)} aria-label={t("goTo", { number: index + 1, title: label })} aria-current={index === active ? "true" : undefined} aria-controls="work-track" />)}
          </div>
          <button type="button" className={styles.carouselArrow} onClick={() => goTo(activeRef.current - 1)} disabled={active === 0} aria-label={t("previous")} aria-controls="work-track"><ArrowIcon direction="left" /></button>
          <button type="button" className={styles.carouselArrow} onClick={() => goTo(activeRef.current + 1)} disabled={active === children.length - 1} aria-label={t("next")} aria-controls="work-track"><ArrowIcon direction="right" /></button>
        </div>
      </div>}
    </div>
  );
}
