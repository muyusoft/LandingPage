import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { routing, type Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/site";
import { getWorkItem, getWorkSlugs } from "@/lib/work";

const mdxComponents = {
  h2: (props: ComponentProps<"h2">) => (
    <h2
      className="mx-auto mt-12 max-w-[68ch] text-2xl font-semibold -tracking-[.035em] text-fg"
      {...props}
    />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="mx-auto mt-4 max-w-[68ch] leading-7 text-muted" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul
      className="mx-auto mt-4 max-w-[68ch] list-disc space-y-2 pl-5 text-muted"
      {...props}
    />
  ),
  img: (props: ComponentProps<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element -- dimensiones desconocidas en contenido MDX
    <img
      className="mx-auto my-10 w-full max-w-(--width-content) rounded-panel border border-line"
      alt=""
      {...props}
    />
  ),
};

type PageParams = { locale: string; slug: string };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getWorkSlugs().map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  try {
    const { frontmatter } = await getWorkItem(slug, locale as Locale);
    return buildMetadata({
      path: `/work/${slug}`,
      locale,
      title: frontmatter.title,
      description: frontmatter.excerpt,
    });
  } catch {
    return {};
  }
}

export default async function WorkCaseStudyPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations("WorkPage");

  let content: Awaited<ReturnType<typeof getWorkItem>>["content"];
  let frontmatter: Awaited<ReturnType<typeof getWorkItem>>["frontmatter"];

  try {
    ({ content, frontmatter } = await getWorkItem(slug, locale as Locale, mdxComponents));
  } catch {
    notFound();
  }

  return (
    <article className="px-6 py-24">
      <header className="mx-auto max-w-[68ch]">
        <p className="text-xs uppercase tracking-[.08em] text-dim">
          {frontmatter.client}{frontmatter.year ? ` · ${frontmatter.year}` : ""}
        </p>
        <h1 className="mt-2 text-4xl font-semibold -tracking-[.035em] text-fg">
          {frontmatter.title}
        </h1>
        <ul className="mt-4 flex flex-wrap gap-2">
          {frontmatter.stack.map((tech) => (
            <li
              key={tech}
              className="rounded-chip border border-line px-2 py-0.5 text-xs text-muted"
            >
              {tech}
            </li>
          ))}
        </ul>
      </header>

      {content}

      <div className="mx-auto mt-16 max-w-[68ch] border-t border-line pt-10">
        <Button
          href="/#contact"
          variant="primary"
          analyticsEvent="cta_click"
          analyticsSection="work_detail"
        >
          {t("cta")}
        </Button>
      </div>
    </article>
  );
}
