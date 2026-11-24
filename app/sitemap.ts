import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { buildLanguageAlternates, localizedUrl } from "@/lib/site";
import { getCaseStudySlugs } from "@/lib/work";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/privacy", "/terms", "/ai-policy"];
  const workPaths = getCaseStudySlugs().map((slug) => `/work/${slug}`);
  const paths = [...staticPaths, ...workPaths];

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: localizedUrl(path, locale),
      alternates: { languages: buildLanguageAlternates(path) },
    })),
  );
}
