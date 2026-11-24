import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { routing, type Locale } from "@/i18n/routing";

type MDXComponents = MDXRemoteProps["components"];

const WORK_DIR = path.join(process.cwd(), "content/work");
const SLUG_PATTERN = /^(.+)\.[a-z]{2}\.mdx$/;

export type WorkStatus = "demo" | "in-progress";
export type ProductLogo = "minga" | "overset" | "proyecta";

export type WorkFrontmatter = {
  /** "in-progress" = producto propio en desarrollo: va en la franja inferior, sin página de detalle. */
  status?: WorkStatus;
  /** Orden dentro de su grupo (menor primero). */
  order?: number;
  title: string;
  client: string;
  year?: number;
  stack: string[];
  excerpt: string;
  /** Solo productos en desarrollo. */
  product?: {
    logo: ProductLogo;
    sector: string;
    platform: string;
  };
  showcase?: {
    visual: "procurement" | "logistics";
    title: string;
    description: string;
    category: string;
    before: string;
    after: string;
    result: string;
  };
};

function readWorkFile(slug: string, locale: Locale) {
  return fs.readFileSync(path.join(WORK_DIR, `${slug}.${locale}.mdx`), "utf8");
}

export function getWorkSlugs(): string[] {
  const slugs = new Set<string>();
  for (const file of fs.readdirSync(WORK_DIR)) {
    const match = file.match(SLUG_PATTERN);
    if (match) slugs.add(match[1]);
  }
  return Array.from(slugs);
}

export type WorkItem = WorkFrontmatter & { slug: string };

export function getAllWorkItems(locale: Locale): WorkItem[] {
  return getWorkSlugs()
    .map((slug) => {
      const { data } = matter(readWorkFile(slug, locale));
      return { slug, ...(data as WorkFrontmatter) };
    })
    .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.slug.localeCompare(b.slug));
}

export function isInProgress(item: Pick<WorkFrontmatter, "status">) {
  return item.status === "in-progress";
}

/** Slugs con página de detalle: los proyectos en desarrollo aún no la tienen. */
export function getCaseStudySlugs(): string[] {
  return getAllWorkItems(routing.defaultLocale)
    .filter((item) => !isInProgress(item))
    .map((item) => item.slug);
}

export async function getWorkItem(
  slug: string,
  locale: Locale,
  components?: MDXComponents,
) {
  return compileMDX<WorkFrontmatter>({
    source: readWorkFile(slug, locale),
    options: { parseFrontmatter: true },
    components,
  });
}
