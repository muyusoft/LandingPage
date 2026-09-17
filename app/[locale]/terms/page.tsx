import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("TermsPage");

  return buildMetadata({
    path: "/terms",
    locale,
    title: t("title"),
    description: t("intro"),
    includeSocialCards: false,
  });
}

export default async function TermsPage() {
  const t = await getTranslations("TermsPage");

  return (
    <article className="mx-auto max-w-[68ch] px-6 py-24">
      <h1 className="text-3xl font-semibold -tracking-[.035em] text-fg">
        {t("title")}
      </h1>
      <p className="mt-6 leading-7 text-muted">{t("intro")}</p>
      <p className="mt-6 rounded-card border border-line bg-surface p-4 text-sm text-dim">
        {t("placeholderNotice")}
      </p>
    </article>
  );
}
