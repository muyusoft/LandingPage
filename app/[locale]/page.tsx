import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Contact } from "@/components/sections/contact";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { HowWeStart } from "@/components/sections/how-we-start";
import { Pitch } from "@/components/sections/pitch";
import { Services } from "@/components/sections/services";
import { Team } from "@/components/sections/team";
import { Testimonials } from "@/components/sections/testimonials";
import { Work } from "@/components/sections/work";
import { SHOW_TESTIMONIALS } from "@/lib/flags";
import { buildMetadata } from "@/lib/site";
import { SectionTransitions } from "@/components/ui/section-transitions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("HomeMetadata");

  return buildMetadata({
    path: "",
    locale,
    title: t("title"),
    description: t("description"),
  });
}

export default function HomePage() {
  return (
    <>
      <SectionTransitions />
      <Hero />
      <Pitch />
      <Services />
      <Team />
      <Work />
      {SHOW_TESTIMONIALS && <Testimonials />}
      <HowWeStart />
      <Faq />
      <Contact />
    </>
  );
}
