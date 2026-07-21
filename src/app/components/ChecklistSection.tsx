import type { ChecklistCategoryStatus } from "@/lib/domain/types";
import styles from "../page.module.css";

export function ChecklistSection({
  checklistStatus,
}: {
  checklistStatus: ChecklistCategoryStatus[];
}) {
  return (
    <section className={styles.section} aria-labelledby="checklist-heading">
      <h2 id="checklist-heading" className={styles.sectionTitle}>
        Required document checklist
      </h2>
      <p className={styles.sectionLead}>
        Status is derived by comparing required checklist categories to each
        submitted file’s declared category.
      </p>
      <ul className={styles.list}>
        {checklistStatus.map((item) => (
          <li key={item.categoryId} className={styles.row}>
            <div className={styles.rowMain}>
              <span className={styles.rowLabel}>{item.label}</span>
              <span className={styles.rowDetail}>
                {item.status === "submitted"
                  ? `Submitted as ${item.filename}`
                  : "No document submitted for this requirement"}
              </span>
            </div>
            <span
              className={`${styles.badge} ${
                item.status === "submitted"
                  ? styles.badgeSubmitted
                  : styles.badgeMissing
              }`}
            >
              {item.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
