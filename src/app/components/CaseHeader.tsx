import type { CaseRecord } from "@/lib/domain/types";
import styles from "../page.module.css";

export function CaseHeader({ caseRecord }: { caseRecord: CaseRecord }) {
  return (
    <header className={styles.header}>
      <p className={styles.eyebrow}>Lawyer case review</p>
      <h1 className={styles.title}>{caseRecord.clientName}</h1>
      <p className={styles.meta}>
        Case {caseRecord.id} · {caseRecord.visaType}
      </p>
      <p className={styles.note}>
        Documents are preloaded .txt samples from{" "}
        <code>samples/cases/demo-case/</code> (no upload in this prototype).
      </p>
    </header>
  );
}
