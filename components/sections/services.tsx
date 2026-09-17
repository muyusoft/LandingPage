import { useTranslations } from "next-intl";
import { ServiceIllustration } from "./service-illustration";
import { ServiceLink } from "./service-link";
import styles from "./showcase.module.css";

const PACKAGES = ["prototype", "custom", "team"] as const;
const DETAILS = ["receives", "objective", "format"] as const;

export function Services() {
  const t = useTranslations("Services");
  return (
    <section id="services" aria-labelledby="services-title" className={styles.section}>
      <div className={styles.wrap}>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <div data-section-enter="" className={styles.heading}>
          <h2 id="services-title">{t("title")}<br /><span>{t("titleAccent")}</span></h2>
          <p>{t("description")}</p>
        </div>
        <div className={styles.services}>
          {PACKAGES.map((key, index) => (
            <article key={key} data-section-enter="" className={styles.service}>
              <div className={styles.serviceNumber}><span>0{index + 1} / {t(`packages.${key}.stage`)}</span><span>{t(`packages.${key}.duration`)}</span></div>
              <h3>{t(`packages.${key}.intent`)}</h3>
              <p className={styles.serviceName}>{t(`packages.${key}.name`)}</p>
              <ServiceIllustration index={index} />
              <dl className={styles.serviceDetails}>
                {DETAILS.map(detail => <div key={detail}><dt>{t(`details.${detail}`)}</dt><dd>{t(`packages.${key}.${detail}`)}</dd></div>)}
              </dl>
              <div className={styles.priceArea}>
                <p className={styles.price}><small>{t("from")}</small>{t(`packages.${key}.amount`)}</p>
                <p className={styles.cadence}>USD · {t(`packages.${key}.cadence`)}</p>
                <ServiceLink service={key} className={styles.serviceCta}>{t(`packages.${key}.cta`)}<span aria-hidden="true">↗</span></ServiceLink>
              </div>
            </article>
          ))}
        </div>
        <div data-section-enter="" className={styles.servicesNote}><span>{t("scopeNote")}</span><ServiceLink service="unsure">{t("helpCta")} ↗</ServiceLink></div>
      </div>
    </section>
  );
}
