import { useTranslations } from "next-intl";
import styles from "./start-contact.module.css";

export function StartArtifact({ index }: { index: number }) {
  const t = useTranslations("HowWeStart.artifacts");
  const keys = ["conversation", "proposal", "sprint", "demo"] as const;
  const key = keys[index];

  return (
    <div className={styles.artifact}>
      <div className={styles.artifactBar}><span>{t(`${key}.header`)}</span><span>{t(`${key}.badge`)}</span></div>
      <div className={styles.artifactBody}>
        {index === 0 && <>
          <div className={styles.agendaTitle}>
            <div className={styles.calendarIcon} aria-hidden="true">↗</div>
            <div><strong>{t("conversation.title")}</strong><small>{t("conversation.subtitle")}</small></div>
          </div>
          {(["problem", "context", "next"] as const).map((row, i) => (
            <div className={styles.agendaRow} key={row}><span>{t(`conversation.${row}`)}</span><span>{[10, 15, 5][i]} min</span></div>
          ))}
        </>}
        {index === 1 && <>
          <p className={styles.docHeading}>{t("proposal.title")}</p>
          {(["scope", "deliverables", "terms", "next"] as const).map(row => (
            <div className={styles.docLine} key={row}><span>{t(`proposal.${row}.label`)}</span><span className={row === "next" ? styles.miniTag : undefined}>{t(`proposal.${row}.value`)}</span></div>
          ))}
        </>}
        {index === 2 && <>
          <p className={styles.docHeading}>{t("sprint.title")}</p>
          <div className={styles.board}>
            {(["todo", "building"] as const).map(column => (
              <div className={styles.boardColumn} key={column}>{t(`sprint.${column}.label`)}<div className={styles.boardTask}>{t(`sprint.${column}.task`)}<small>{t(`sprint.${column}.note`)}</small></div></div>
            ))}
          </div>
        </>}
        {index === 3 && <div className={styles.demoApp}>
          <strong>{t("demo.title")}</strong>
          {(["flow", "access", "feedback"] as const).map(row => (
            <div className={styles.demoRow} key={row}><span>{t(`demo.${row}.label`)}</span><span className={row === "flow" ? styles.miniTag : undefined}>{t(`demo.${row}.value`)}</span></div>
          ))}
        </div>}
      </div>
    </div>
  );
}
