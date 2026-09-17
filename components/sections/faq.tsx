import { useTranslations } from "next-intl";
import { Accordion } from "@/components/ui/accordion";
import styles from "./faq.module.css";

const QUESTION_KEYS = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
] as const;

export function Faq() {
  const t = useTranslations("FAQ");

  const items = QUESTION_KEYS.map((key) => ({
    question: t(`items.${key}.question`),
    answer: t(`items.${key}.answer`),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <section id="faq" aria-labelledby="faq-title" className={styles.section}>
      <div className={styles.layout}>
        <div data-section-enter="" className={styles.intro}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h2 id="faq-title">{t("title")}</h2>
          <p className={styles.description}>{t("description")}</p>
          <div className={styles.contact}>
            <p>{t("contactPrompt")}</p>
            <a href="#contact">{t("contactCta")} <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <div data-section-enter="" className={styles.questions}>
          <Accordion items={items} />
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
