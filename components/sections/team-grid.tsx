"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Image, { type StaticImageData } from "next/image";
import { useTranslations } from "next-intl";
import { ArrowIcon } from "@/components/ui/arrow-icon";
import { Reveal } from "@/components/ui/reveal";
import { trackEvent } from "@/lib/analytics";
import styles from "./team-profile.module.css";

export type TeamMember = {
  key: string;
  name: string;
  role: string;
  bio: string;
  focus: string[];
  photo?: StaticImageData;
  /** Posición vertical de la foto en la portada de la hoja (object-position), para que la cara quede sobre el nombre. */
  photoFocus?: string;
  links: { label: string; href: string }[];
};

/** Distancia (px) que hay que arrastrar la hoja hacia abajo, ya en su altura mínima, para cerrarla. */
const SWIPE_CLOSE_DISTANCE = 90;
/** Arrastre mínimo (px) para cambiar de altura; por debajo cuenta como toque. */
const SWIPE_STEP_DISTANCE = 40;
const TAP_TOLERANCE = 6;
/** Alto máximo de la hoja respecto a la ventana; igual que max-height en team-profile.module.css. */
const SHEET_MAX_VIEWPORT = 0.88;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Portrait({ member, sizes, className, focus }: { member: TeamMember; sizes: string; className: string; focus?: string }) {
  return (
    <div className={`relative overflow-hidden bg-surface-2 ${className}`}>
      {member.photo ? (
        <Image src={member.photo} alt="" fill placeholder="blur" sizes={sizes} className="object-cover" style={focus ? { objectPosition: `50% ${focus}` } : undefined} />
      ) : (
        <div aria-hidden="true" className="flex h-full w-full items-center justify-center font-mono text-sm text-accent-2 sm:text-4xl">
          {getInitials(member.name)}
        </div>
      )}
    </div>
  );
}

/**
 * Bloquea el scroll de la página mientras la hoja está abierta. Usa overflow en <html> y no
 * position: fixed en <body>, para no mover window.scrollY (el navbar lo usa para su fondo).
 */
function lockPageScroll() {
  const root = document.documentElement;
  const previous = { overflow: root.style.overflow, paddingRight: root.style.paddingRight };
  // Compensa el ancho de la barra de scroll en escritorio para que la página no salte.
  const scrollbar = window.innerWidth - root.clientWidth;
  root.style.overflow = "hidden";
  if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;
  return () => Object.assign(root.style, previous);
}

export function TeamGrid({ members }: { members: TeamMember[] }) {
  const t = useTranslations("Team");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dragRef = useRef<{ startY: number; dy: number; startH: number; base: number; max: number } | null>(null);
  /** Hoja expandida (foto completa). Se maneja sin estado de React: solo cambia una variable CSS. */
  const expandedRef = useRef(false);
  /** Alto de la foto con la hoja en su altura inicial; se mide al empezar cada arrastre sin expandir. */
  const baseHeightRef = useRef(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const member = openIndex === null ? null : members[openIndex];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (openIndex === null || !dialog) return;
    const unlock = lockPageScroll();
    dialog.showModal();
    return () => {
      unlock();
      if (dialog.open) dialog.close();
      triggerRef.current?.focus();
    };
  }, [openIndex]);

  function open(index: number, trigger: HTMLButtonElement) {
    triggerRef.current = trigger;
    expandedRef.current = false;
    sheetRef.current?.style.removeProperty("--photo-h");
    setOpenIndex(index);
    trackEvent("team_profile_open", { member: members[index].key });
  }

  function close() {
    setOpenIndex(null);
  }

  function goToContact() {
    close();
    // Tras liberar el scroll de la página, baja a contacto.
    requestAnimationFrame(() => document.getElementById("contact")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    }));
  }

  /*
   * Hoja de dos alturas (solo móvil): arrastrar la foto hacia arriba la expande hasta su proporción
   * natural; hacia abajo la reduce y, desde la altura inicial, cierra la hoja. Tocarla alterna.
   */
  function photoLimits(sheet: HTMLDivElement) {
    const photo = sheet.querySelector<HTMLElement>(`.${styles.photo}`);
    const current = photo?.getBoundingClientRect().height ?? 0;
    if (!expandedRef.current) baseHeightRef.current = current;
    const base = baseHeightRef.current;
    const rest = sheet.getBoundingClientRect().height - current;
    const ratio = member?.photo ? member.photo.height / member.photo.width : 1.25;
    const max = Math.max(base, Math.min(sheet.clientWidth * ratio, window.innerHeight * SHEET_MAX_VIEWPORT - rest));
    return { current, base, max };
  }

  /** `max` viene medido al inicio del arrastre; sin arrastre se mide ahora, con la foto en reposo. */
  function setExpanded(next: boolean, max = sheetRef.current ? photoLimits(sheetRef.current).max : 0) {
    const sheet = sheetRef.current;
    if (!sheet) return;
    expandedRef.current = next;
    if (next) sheet.style.setProperty("--photo-h", `${Math.round(max)}px`);
    else sheet.style.removeProperty("--photo-h");
  }

  function onDragStart(event: ReactPointerEvent<HTMLDivElement>) {
    const sheet = sheetRef.current;
    if (!sheet || window.matchMedia("(min-width: 640px)").matches) return;
    const { current, base, max } = photoLimits(sheet);
    dragRef.current = { startY: event.clientY, dy: 0, startH: current, base, max };
    sheet.classList.add(styles.dragging);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onDragMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const sheet = sheetRef.current;
    if (!drag || !sheet) return;
    drag.dy = event.clientY - drag.startY;
    let height = drag.startH - drag.dy;
    let offset = 0;
    // Más allá del máximo, resistencia; por debajo de la altura inicial, la hoja entera baja.
    if (height > drag.max) height = drag.max + (height - drag.max) * 0.2;
    if (height < drag.base) {
      offset = drag.base - height;
      height = drag.base;
    }
    sheet.style.setProperty("--photo-h", `${height}px`);
    sheet.style.transform = offset ? `translateY(${offset}px)` : "";
  }

  function onDragEnd() {
    const drag = dragRef.current;
    const sheet = sheetRef.current;
    dragRef.current = null;
    if (!drag || !sheet) return;
    sheet.classList.remove(styles.dragging);
    sheet.style.transform = "";
    const expanded = expandedRef.current;
    if (Math.abs(drag.dy) < TAP_TOLERANCE) return setExpanded(!expanded, drag.max);
    if (drag.startH - drag.dy < drag.base - SWIPE_CLOSE_DISTANCE) return close();
    if (drag.dy < -SWIPE_STEP_DISTANCE) return setExpanded(true, drag.max);
    if (drag.dy > SWIPE_STEP_DISTANCE) return setExpanded(false, drag.max);
    setExpanded(expanded, drag.max);
  }

  return (
    <>
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {members.map((item, index) => (
          <Reveal key={item.key} index={index}>
            <button
              type="button"
              onClick={(event) => open(index, event.currentTarget)}
              aria-haspopup="dialog"
              aria-label={t("openProfile", { name: item.name })}
              className={`${styles.card} group flex h-full w-full flex-row items-center gap-4 overflow-hidden rounded-card border border-line bg-surface p-4 text-left sm:flex-col sm:items-stretch sm:gap-0 sm:p-0`}
            >
              {/* Móvil: foto pequeña junto al nombre. sm+: retrato grande arriba. */}
              <Portrait
                member={item}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 64px"
                className="h-16 w-16 shrink-0 rounded-full sm:aspect-[4/5] sm:h-auto sm:w-full sm:shrink sm:rounded-none"
              />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:gap-1 sm:p-6">
                <span className="font-semibold text-fg">{item.name}</span>
                <span className="text-sm text-muted">{item.role}</span>
                <span className="mt-1 hidden items-center gap-2 text-xs text-accent-2 sm:mt-3 sm:flex">
                  {t("viewProfile")}
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"><ArrowIcon /></span>
                </span>
              </span>
              <span aria-hidden="true" className="shrink-0 text-muted sm:hidden"><ArrowIcon direction="right" /></span>
            </button>
          </Reveal>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="team-profile-name"
        onCancel={(event) => { event.preventDefault(); close(); }}
        onClick={(event) => { if (event.target === event.currentTarget) close(); }}
      >
        {member && (
          <div ref={sheetRef} className={styles.sheet}>
            <div
              className={styles.grab}
              onPointerDown={onDragStart}
              onPointerMove={onDragMove}
              onPointerUp={onDragEnd}
              onPointerCancel={onDragEnd}
              aria-hidden="true"
            >
              <span />
            </div>
            <button type="button" className={styles.close} onClick={close} aria-label={t("close")} autoFocus>
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
            <div className={styles.layout}>
              <Portrait member={member} sizes="(min-width: 640px) 260px, 100vw" className={styles.photo} focus={member.photoFocus} />
              <div className={styles.body}>
                <div className={styles.head}>
                  <h3 id="team-profile-name" className={styles.name}>{member.name}</h3>
                  <p className={styles.role}>{member.role}</p>
                </div>
                <p className={styles.bio}>{member.bio}</p>
                <p className={styles.kicker}>{t("focusTitle")}</p>
                <ul className={styles.focus}>
                  {member.focus.map((item) => <li key={item}>{item}</li>)}
                </ul>
                {member.links.length > 0 && (
                  <>
                    <p className={styles.kicker}>{t("linksTitle")}</p>
                    <ul className={styles.links}>
                      {member.links.map((link) => (
                        <li key={link.href}>
                          <a href={link.href} target="_blank" rel="noopener noreferrer">
                            {link.label} <span aria-hidden="true"><ArrowIcon /></span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <button type="button" className={styles.cta} onClick={goToContact}>
                  {t("contactCta")} <span aria-hidden="true"><ArrowIcon direction="right" /></span>
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
