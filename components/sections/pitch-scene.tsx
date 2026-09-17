"use client";

import { useTranslations } from "next-intl";
import styles from "./pitch.module.css";

function MiniApp({ reviewed = false }: { reviewed?: boolean }) {
  const t = useTranslations("Pitch.visual");
  return (
    <div className={styles.miniapp}>
      <div className={styles.appbar}><b>◈ &nbsp; {t("portal")}</b><span>{t(reviewed ? "weekly" : "prototype")}</span></div>
      <div className={styles.appbody}>
        <div className={styles.sidebar} aria-hidden="true"><i /><i /><i /></div>
        <div className={styles.table}>
          <div className={styles.tableHead}>{t("requests")}<span className={styles.tinyButton}>+ {t("new")}</span></div>
          <div className={styles.row}><span>{t("designTeam")}</span><span className={styles.pill}>{t(reviewed ? "approved" : "received")}</span></div>
          <div className={styles.row}><span>{t("platformAccess")}</span><span className={reviewed ? styles.pill : undefined}>{t(reviewed ? "received" : "inReview")}</span></div>
        </div>
      </div>
    </div>
  );
}

export function PitchScene({ index }: { index: number }) {
  const t = useTranslations("Pitch.visual");

  if (index === 0) return (
    <>
      <p className={styles.smallLabel}>01 / {t("ideaLabel")}</p>
      <div className={styles.brief}><strong>{t("briefTitle")}</strong><p>{t("briefDescription")}</p></div>
      <div className={styles.flow} aria-hidden="true" />
      <MiniApp />
    </>
  );

  if (index === 1) return (
    <>
      <p className={styles.smallLabel}>02 / {t("reviewLabel")}</p>
      <div className={styles.reviewHead}><strong>{t("createRequest")}</strong><span className={styles.pill}>{t("reviewed")}</span></div>
      <div className={styles.code} role="img" aria-label={t("codeDescription")}>
        <code aria-hidden="true"><span className={styles.dim}>{`// ${t("aiProposal")}`}</span><br />
          {"async function createRequest(input) {"}
          <span className={styles.add}>+ &nbsp;validatePermissions(user);</span>
          {"  return saveRequest(input);"}<br />{"}"}
        </code>
      </div>
      <div className={styles.comment}><span className={styles.avatar} aria-hidden="true">MS</span><div><strong>{t("engineerReview")}</strong><p>{t("reviewComment")}</p></div></div>
      <div className={styles.approval}><span>✓ &nbsp; {t("correction")}</span><span>{t("engineerApproval")}</span></div>
    </>
  );

  if (index === 2) return (
    <>
      <p className={styles.smallLabel}>03 / {t("demoLabel")}</p>
      <div className={styles.url}>↗ &nbsp; staging.project.example</div>
      <MiniApp reviewed />
      <div className={styles.feedback}><span className={styles.avatar}>{t("you")}</span><p>{t("feedback")}<small>{t("feedbackContext")}</small></p></div>
    </>
  );

  return (
    <>
      <p className={styles.smallLabel}>04 / {t("deliveryLabel")}</p>
      <p className={styles.deliveryTitle}>{t("deliveryTitle")}</p>
      <p className={styles.deliveryCopy}>{t("deliveryCopy")}</p>
      <div className={styles.deliverables}>
        {(["code", "docs", "tests", "access"] as const).map((key, i) => (
          <div className={styles.deliverable} key={key}><span aria-hidden="true">{["⌘", "≡", "✓", "↗"][i]}</span>{t(`deliverables.${key}.title`)}<small>{t(`deliverables.${key}.description`)}</small></div>
        ))}
      </div>
      <div className={styles.ownership}><span>✓ &nbsp; {t("ready")}</span><span>{t("ownership")}</span></div>
    </>
  );
}
