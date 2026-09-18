import type { ReactNode } from "react";
import styles from "./expanding-panel.module.css";

export function ExpandingPanel({ open, id, labelledBy, children, className = "" }: {
  open: boolean;
  id: string;
  labelledBy: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div id={id} role="region" aria-labelledby={labelledBy} aria-hidden={!open} inert={!open}
      data-open={open} className={`${styles.panel} ${className}`}>
      <div className={styles.clip}>{children}</div>
    </div>
  );
}
