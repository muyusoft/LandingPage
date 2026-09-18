import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export function localizedUrl(path: string, locale: string) {
  return `${SITE_URL}/${locale}${path}`;
}

// Para el <link rel="alternate" hreflang> de cada ruta (sección 6.3 del spec).
export function buildLanguageAlternates(path: string) {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, localizedUrl(path, locale)]),
  );
}

type BuildMetadataInput = {
  path: string;
  locale: string;
  title: string;
  description: string;
  /** Páginas no pensadas para compartirse (legales) pueden omitir OG/Twitter. */
  includeSocialCards?: boolean;
};

// generateMetadata por locale con OG y Twitter Card — sección 7 del spec.
export function buildMetadata({
  path,
  locale,
  title,
  description,
  includeSocialCards = true,
}: BuildMetadataInput): Metadata {
  const url = localizedUrl(path, locale);

  return {
    title,
    description,
    alternates: { canonical: url, languages: buildLanguageAlternates(path) },
    ...(includeSocialCards && {
      openGraph: {
        title,
        description,
        url,
        siteName: "MuyuSoft",
        locale,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    }),
  };
}
