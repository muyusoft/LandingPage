import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import type { Locale } from "@/i18n/routing";

type MDXComponents = MDXRemoteProps["components"];

const WORK_DIR = path.join(process.cwd(), "content/work");
const SLUG_PATTERN = /^(.+)\.[a-z]{2}\.mdx$/;

export type WorkFrontmatter = {
  title: string;
  client: string;
  year: number;
  stack: string[];
  excerpt: string;
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

export function getAllWorkItems(locale: Locale) {
  return getWorkSlugs().map((slug) => {
    const { data } = matter(readWorkFile(slug, locale));
    return { slug, ...(data as WorkFrontmatter) };
  });
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
