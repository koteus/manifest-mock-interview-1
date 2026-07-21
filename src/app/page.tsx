import { getCaseView } from "@/lib/case/get-case-view";
import type { DocumentCategory } from "@/lib/domain/types";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

function categoryLabel(
  categoryId: DocumentCategory,
  labels: Map<DocumentCategory, string>,
): string {
  return labels.get(categoryId) ?? categoryId;
}

export default async function Home() {
  const data = await getCaseView();
  const labels = new Map(
    data.checklist.categories.map((category) => [category.id, category.label]),
  );

  const submitted = data.checklistStatus.filter(
    (item) => item.status === "submitted",
  );
  const missing = data.checklistStatus.filter(
    (item) => item.status === "missing",
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Lawyer case review</p>
        <h1 className={styles.title}>{data.case.clientName}</h1>
        <p className={styles.meta}>
          Case {data.case.id} · {data.case.visaType}
        </p>
        <p className={styles.note}>
          Documents are preloaded .txt samples from{" "}
          <code>samples/cases/demo-case/</code> (no upload in this prototype).
        </p>
      </header>

      <section className={styles.section} aria-labelledby="checklist-heading">
        <h2 id="checklist-heading" className={styles.sectionTitle}>
          Required document checklist
        </h2>
        <p className={styles.sectionLead}>
          Status is derived by comparing required checklist categories to each
          submitted file’s declared category.
        </p>
        <ul className={styles.list}>
          {data.checklistStatus.map((item) => (
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

      <div className={styles.twoCol}>
        <section
          className={styles.section}
          aria-labelledby="submitted-heading"
        >
          <h2 id="submitted-heading" className={styles.sectionTitle}>
            Submitted documents
          </h2>
          {submitted.length === 0 ? (
            <p className={styles.empty}>No documents submitted.</p>
          ) : (
            <ul className={styles.list}>
              {data.documents.map((document) => (
                <li key={document.id} className={styles.row}>
                  <div className={styles.rowMain}>
                    <span className={styles.rowLabel}>{document.filename}</span>
                    <span className={styles.rowDetail}>
                      Declared category:{" "}
                      {categoryLabel(document.declaredCategory, labels)}
                    </span>
                  </div>
                  <span
                    className={`${styles.badge} ${styles.badgeSubmitted}`}
                  >
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

      <section className={styles.section} aria-labelledby="findings-heading">
        <h2 id="findings-heading" className={styles.sectionTitle}>
          AI findings
        </h2>
        <div className={styles.findingsPlaceholder}>
          {data.findings.length === 0
            ? "No findings yet. AI review will populate this list in the next slice."
            : null}
        </div>
      </section>
    </main>
  );
}
