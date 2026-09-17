import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const TESTIMONIAL_KEYS = ["one", "two"] as const;

export function Testimonials() {
  const t = useTranslations("Testimonials");

  return (
    <section
      id="testimonials"
      className="mx-auto max-w-(--width-content) px-6 py-24"
    >
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {TESTIMONIAL_KEYS.map((key, index) => (
          <Reveal key={key} index={index}>
            <Card className="flex h-full flex-col gap-4 p-8">
              <p className="text-lg text-fg">&ldquo;{t(`items.${key}.quote`)}&rdquo;</p>
              <div>
                <p className="font-semibold text-fg">{t(`items.${key}.name`)}</p>
                <p className="text-sm text-muted">
                  {t(`items.${key}.role`)} · {t(`items.${key}.company`)}
                </p>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
