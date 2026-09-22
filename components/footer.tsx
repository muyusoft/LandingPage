import { useTranslations } from "next-intl";
import Image from "next/image";
import logoWhite from "@/assets/brand/logo-white.png";
import { Link } from "@/lib/i18n";

const SITE_LINKS = [
  { key: "services", href: "/#services" },
  { key: "team", href: "/#team" },
  { key: "work", href: "/#work" },
  { key: "contact", href: "/#contact" },
] as const;

const LEGAL_LINKS = [
  { key: "privacy", href: "/privacy" },
  { key: "terms", href: "/terms" },
  { key: "aiPolicy", href: "/ai-policy" },
] as const;

export function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Nav");

  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-(--width-content) gap-10 px-6 py-16 sm:grid-cols-3">
        <div>
          <Image src={logoWhite} alt="MuyuSoft" className="h-14 w-auto" />
          <p className="mt-3 max-w-xs text-sm text-muted">{t("tagline")}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[.08em] text-dim">
            {t("siteColumn")}
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {SITE_LINKS.map((link) => (
              <li key={link.key}>
                <Link href={link.href} className="text-sm text-muted hover:text-fg">
                  {tNav(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[.08em] text-dim">
            {t("legalColumn")}
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.key}>
                <Link href={link.href} className="text-sm text-muted hover:text-fg">
                  {t(`legal.${link.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line px-6 py-6 text-center text-xs text-dim">
        {t("copyright", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
