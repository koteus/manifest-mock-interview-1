import { categoryLabel } from "@/lib/case/category-labels";
import type {
  CaseApiResponse,
  ChecklistCategoryStatus,
  DocumentCategory,
} from "@/lib/domain/types";
import styles from "../page.module.css";

export function DocumentsSection({
  checklistStatus,
  documents,
  categoryLabels,
}: {
  checklistStatus: ChecklistCategoryStatus[];
  documents: CaseApiResponse["documents"];
  categoryLabels: Map<DocumentCategory, string>;
}) {
  const submitted = checklistStatus.filter(
    (item) => item.status === "submitted",
  );
  const missing = checklistStatus.filter((item) => item.status === "missing");

  return (
    <div className={styles.twoCol}>
      <section className={styles.section} aria-labelledby="submitted-heading">
        <h2 id="submitted-heading" className={styles.sectionTitle}>
          Submitted documents
        </h2>
        {submitted.length === 0 ? (
          <p className={styles.empty}>No documents submitted.</p>
        ) : (
          <ul className={styles.list}>
            {documents.map((document) => (
              <li key={document.id} className={styles.row}>
                <div className={styles.rowMain}>
                  <span className={styles.rowLabel}>{document.filename}</span>
                  <span className={styles.rowDetail}>
                    Declared category:{" "}
                    {categoryLabel(document.declaredCategory, categoryLabels)}
                  </span>
                </div>
                <span className={`${styles.badge} ${styles.badgeSubmitted}`}>
                  submitted
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.section} aria-labelledby="missing-heading">
        <h2 id="missing-heading" className={styles.sectionTitle}>
          Missing requirements
        </h2>
        {missing.length === 0 ? (
          <p className={styles.empty}>All required categories are present.</p>
        ) : (
          <ul className={styles.list}>
            {missing.map((item) => (
              <li key={item.categoryId} className={styles.row}>
                <div className={styles.rowMain}>
                  <span className={styles.rowLabel}>{item.label}</span>
                  <span className={styles.rowDetail}>
                    Required by checklist; no submitted file declares this
                    category.
                  </span>
                </div>
                <span className={`${styles.badge} ${styles.badgeMissing}`}>
                  missing
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
