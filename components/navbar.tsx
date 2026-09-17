"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
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

function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <fieldset className="m-0 flex items-center gap-1 rounded-chip border border-line p-0.5">
      <legend className="sr-only">Language</legend>
      {routing.locales.map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={locale === code}
          onClick={() => router.replace(pathname, { locale: code })}
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
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 40);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Escape cierra el menú móvil y devuelve el foco al botón que lo abrió.
  useEffect(() => {
    if (!mobileOpen) return;

    const firstLink = mobileMenuRef.current?.querySelector("a");
    (firstLink as HTMLElement | null)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        menuToggleRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
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
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-sm font-semibold text-fg"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-chip bg-accent-2 text-bg"
          >
            M
          </span>
          <span>Muyusoft</span>
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
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-11 w-11 items-center justify-center text-fg lg:hidden"
        >
          <span aria-hidden="true">{mobileOpen ? "✕" : "☰"}</span>
          <span className="sr-only">{t(mobileOpen ? "closeMenu" : "openMenu")}</span>
        </button>
      </div>

      {mobileOpen && (
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          className="max-h-[calc(100svh_-_var(--height-nav))] overflow-y-auto border-t border-line bg-bg px-6 py-4 lg:hidden"
        >
          <nav
            className="flex flex-col gap-1"
            aria-label={t("primary")}
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={`/#${item.id}`}
                onClick={() => setMobileOpen(false)}
                aria-current={activeId === item.id ? "true" : undefined}
                className={`flex min-h-11 items-center text-sm ${
                  activeId === item.id ? "text-accent-2" : "text-muted"
                }`}
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>
          <div className="mt-4 border-t border-line pt-4">
            <LocaleSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}
