import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("AiPolicyPage");

  return buildMetadata({
    path: "/ai-policy",
    locale,
    title: t("title"),
    description: t("intro"),
    includeSocialCards: false,
  });
}

export default async function AiPolicyPage() {
  const t = await getTranslations("AiPolicyPage");

  return (
    <article className="mx-auto max-w-[68ch] px-6 py-24">
      <h1 className="text-3xl font-semibold -tracking-[.035em] text-fg">
        {t("title")}
      </h1>
      <p className="mt-6 leading-7 text-muted">{t("intro")}</p>
      <p className="mt-4 leading-7 text-muted">{t("practice")}</p>
      <p className="mt-4 leading-7 text-muted">{t("clientData")}</p>
      <p className="mt-6 text-sm text-dim">{t("updates")}</p>
    </article>
  );
}
