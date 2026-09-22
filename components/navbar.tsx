"use client";

import { ArrowIcon } from "@/components/ui/arrow-icon";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import logoWhite from "@/assets/brand/logo-white.png";
import styles from "./navbar.module.css";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { routing } from "@/i18n/routing";
import { Link, usePathname, useRouter } from "@/lib/i18n";

const NAV_ITEMS = [
  { id: "pitch", labelKey: "approach" },
  { id: "services", labelKey: "services" },
  { id: "team", labelKey: "team" },
  { id: "work", labelKey: "work" },
  { id: "how-we-start", labelKey: "howWeStart" },
  { id: "faq", labelKey: "faq" },
  { id: "contact", labelKey: "contact" },
] as const;

const OBSERVED_SECTION_IDS = [
  "hero",
  ...NAV_ITEMS.map((item) => item.id),
] as const;

function LocaleSwitcher({ onSelect }: { onSelect?: () => void }) {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <fieldset className="m-0 flex items-center gap-1 rounded-chip border border-line p-0.5">
      <legend className="sr-only">{t("language")}</legend>
      {routing.locales.map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={locale === code}
          onClick={() => {
            const suffix = window.location.search + window.location.hash;
            onSelect?.();
            router.replace(`${pathname}${suffix}`, { locale: code, scroll: false });
          }}
          className={`min-h-11 rounded-chip px-2.5 text-xs font-medium uppercase transition-colors ${
            locale === code ? "bg-accent-2 text-bg" : "text-muted hover:text-fg"
          }`}
        >
          {code}
        </button>
      ))}
    </fieldset>
  );
}

export function Navbar() {
  const t = useTranslations("Nav");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeId = useScrollSpy(OBSERVED_SECTION_IDS);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDialogElement>(null);
  const restoreScrollRef = useRef<(() => void) | null>(null);
  const pathname = usePathname();

  function closeMenu() {
    restoreScrollRef.current?.();
    restoreScrollRef.current = null;
    mobileMenuRef.current?.close();
    setMobileOpen(false);
  }

  function navigate(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    closeMenu();
    if (pathname !== "/") return;
    const section = document.getElementById(id);
    if (!section) return;
    event.preventDefault();
    window.history.pushState(null, "", `${window.location.pathname}${window.location.search}#${id}`);
    const hadTabIndex = section.hasAttribute("tabindex");
    if (!hadTabIndex) section.setAttribute("tabindex", "-1");
    section.focus({ preventScroll: true });
    section.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    if (!hadTabIndex) section.addEventListener("blur", () => section.removeAttribute("tabindex"), { once: true });
  }

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 40);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const dialog = mobileMenuRef.current;
    if (!dialog) return;
    const body = document.body;
    const y = window.scrollY;
    const previous = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: body.style.overflow };
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    const restore = () => {
      Object.assign(body.style, previous);
      window.scrollTo({ top: y, behavior: "instant" });
    };
    restoreScrollRef.current = restore;
    dialog.showModal();
    const desktop = window.matchMedia("(min-width:1024px)");
    function handleResize() {
      if (!desktop.matches) return;
      restoreScrollRef.current?.();
      restoreScrollRef.current = null;
      dialog?.close();
      setMobileOpen(false);
    }
    desktop.addEventListener("change", handleResize);
    return () => {
      desktop.removeEventListener("change", handleResize);
      restoreScrollRef.current?.();
      restoreScrollRef.current = null;
      if (dialog.open) dialog.close();
    };
  }, [mobileOpen]);

  return (
    <header
      className={`sticky top-0 z-50 h-(--height-nav) border-b transition-colors duration-300 ${
        scrolled
          ? "border-line bg-bg/80 backdrop-blur"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-full max-w-(--width-content) items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <Image src={logoWhite} alt="MuyuSoft" className="h-10 w-auto" priority />
        </Link>

        <nav
          className="hidden items-center gap-6 lg:flex"
          aria-label={t("primary")}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={`/#${item.id}`}
              aria-current={activeId === item.id ? "true" : undefined}
              className={`text-sm transition-colors ${
                activeId === item.id ? "text-accent-2" : "text-muted hover:text-fg"
              }`}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex">
          <LocaleSwitcher />
        </div>

        <button
          ref={menuToggleRef}
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen(true)}
          className="flex h-11 items-center justify-center gap-2 rounded-btn border border-line px-3 text-sm text-fg lg:hidden"
        >
          <span>{t("menu")}</span>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 8h16M4 16h16" /></svg>
        </button>
      </div>

      <dialog
        id="mobile-menu"
        ref={mobileMenuRef}
        className={styles.dialog}
        aria-label={t("primary")}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onCancel={(event) => { event.preventDefault(); closeMenu(); }}
        onClose={() => { setMobileOpen(false); }}
        onClick={(event) => { if (event.target === event.currentTarget) closeMenu(); }}
      >
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.brand}><Image src={logoWhite} alt="MuyuSoft" /></span>
            <button type="button" className={styles.close} onClick={closeMenu} aria-label={t("closeMenu")} autoFocus>
              <span>{t("close")}</span>
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
          </div>
          <div className={styles.panelContent}>
            <p className={styles.kicker}>{t("explore")}</p>
            <nav className={styles.links} aria-label={t("primary")}>
              {NAV_ITEMS.filter(item => item.id !== "contact").map(item => (
                <Link key={item.id} href={`/#${item.id}`} onClick={event => navigate(event, item.id)} aria-current={activeId === item.id ? "location" : undefined}>
                  <span>{t(item.labelKey)}</span><span className={styles.indicator} aria-hidden="true">{activeId === item.id ? "●" : <ArrowIcon />}</span>
                </Link>
              ))}
            </nav>
            <div className={styles.bottom}>
              <Link href="/#contact" className={styles.contact} aria-current={activeId === "contact" ? "location" : undefined} onClick={event => navigate(event, "contact")}>
                {t("contactCta")}<span aria-hidden="true"><ArrowIcon /></span>
              </Link>
              <div className={styles.language}><span>{t("language")}</span><LocaleSwitcher onSelect={closeMenu} /></div>
            </div>
          </div>
        </div>
      </dialog>
    </header>
  );
}
