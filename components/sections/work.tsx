import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/lib/i18n";
import { getAllWorkItems } from "@/lib/work";
import { WorkCarousel } from "./work-carousel";
import { WorkIllustration } from "./work-illustration";
import styles from "./showcase.module.css";

export function Work() {
  const locale = useLocale() as Locale;
  const t = useTranslations("Work");
  const items = getAllWorkItems(locale);
  return (
    <section id="work" aria-labelledby="work-title" className={`${styles.section} ${styles.workSection}`}>
      <div className={styles.wrap}>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <div data-section-enter="" className={styles.heading}>
          <h2 id="work-title">{t("title")}<br /><span>{t("titleAccent")}</span></h2>
          <p>{t("description")}</p>
        </div>
        <WorkCarousel labels={items.map(item => item.showcase?.title ?? item.title)}>
          {items.map(item => {
            const preview = item.showcase;
            return (
              <article key={item.slug} className={`${styles.case} ${preview?.visual === "logistics" ? styles.logistics : ""}`}>
                {preview && <WorkIllustration variant={preview.visual} />}
                <div className={styles.caseCopy}>
                  <p className={styles.caseCategory}>{preview?.category ?? item.client}</p>
                  <h3>{preview?.title ?? item.title}</h3>
                  <p className={styles.caseDescription}>{preview?.description ?? item.excerpt}</p>
                  {preview && <div className={styles.result}>
                    <p className={styles.resultValue}>{preview.before} <span aria-hidden="true">→</span> <strong>{preview.after}</strong></p>
                    <p className={styles.resultLabel}>{preview.result}</p>
                  </div>}
                  <p className={styles.caseMeta}>{item.stack.join(" · ")} &nbsp; / &nbsp; {item.year}</p>
                  <Link href={`/work/${item.slug}`} className={styles.caseCta}>{t("explore")} <span aria-hidden="true">↗</span></Link>
                </div>
              </article>
            );
          })}
        </WorkCarousel>
      </div>
    </section>
  );
}
