"use client";

import { categoryLabel } from "@/lib/case/category-labels";
import type { CriterionLabelLookup } from "@/lib/case/criterion-labels";
import type {
  CaseApiResponse,
  DocumentCategory,
  Finding,
  FindingStatus,
  LawyerReviewDecision,
  ReviewStatus,
} from "@/lib/domain/types";
import styles from "../page.module.css";

function findingFilename(
  finding: Finding,
  documents: CaseApiResponse["documents"],
): string | null {
  if (!finding.documentId) {
    return null;
  }
  return (
    documents.find((document) => document.id === finding.documentId)?.filename ??
    null
  );
}

function findingStatusBadgeClass(status: FindingStatus): string {
  switch (status) {
    case "missing":
      return styles.badgeMissing;
    case "failed":
      return styles.badgeFailed;
    case "uncertain":
      return styles.badgeUncertain;
    case "passed":
      return styles.badgeSubmitted;
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

function reviewBadgeClass(reviewStatus: Exclude<ReviewStatus, "pending">): string {
  switch (reviewStatus) {
    case "accepted":
      return styles.badgeReviewAccepted;
    case "dismissed":
      return styles.badgeReviewDismissed;
    default: {
      const exhaustive: never = reviewStatus;
      return exhaustive;
    }
  }
}

export function FindingGroup({
  title,
  findings,
  documents,
  categoryLabels,
  criterionLabel,
  reviewingFindingId,
  onReview,
}: {
  title: string;
  findings: Finding[];
  documents: CaseApiResponse["documents"];
  categoryLabels: Map<DocumentCategory, string>;
  criterionLabel: CriterionLabelLookup;
  reviewingFindingId: string | null;
  onReview: (findingId: string, reviewStatus: LawyerReviewDecision) => void;
}) {
  return (
    <section className={styles.findingGroup} aria-label={title}>
      <h3 className={styles.findingGroupTitle}>
        {title} <span className={styles.count}>({findings.length})</span>
      </h3>
      {findings.length === 0 ? (
        <p className={styles.empty}>None.</p>
      ) : (
        <ul className={styles.list}>
          {findings.map((finding) => {
            const filename = findingFilename(finding, documents);
            const isReviewing = reviewingFindingId === finding.id;

            return (
              <li key={finding.id} className={styles.findingRow}>
                <div className={styles.findingHeader}>
                  <div className={styles.rowMain}>
                    <span className={styles.rowLabel}>
                      {categoryLabel(finding.category, categoryLabels)} ·{" "}
                      {criterionLabel(finding.category, finding.criterionId)}
                    </span>
                    <span className={styles.rowDetail}>
                      {filename
                        ? `File: ${filename}`
                        : "No file linked (category missing)"}
                    </span>
                  </div>
                  <div className={styles.findingBadges}>
                    <span
                      className={`${styles.badge} ${findingStatusBadgeClass(finding.status)}`}
                    >
                      {finding.status}
                    </span>
                    {finding.reviewStatus !== "pending" ? (
                      <span
                        className={`${styles.badge} ${reviewBadgeClass(finding.reviewStatus)}`}
                      >
                        {finding.reviewStatus}
                      </span>
                    ) : null}
                  </div>
                </div>
                <p className={styles.findingMessage}>{finding.message}</p>
                {finding.evidence ? (
                  <blockquote className={styles.evidence}>
                    {finding.evidence}
                  </blockquote>
                ) : null}
                {finding.reviewStatus === "pending" ? (
                  <div className={styles.findingActions}>
                    <button
                      type="button"
                      className={styles.acceptButton}
                      disabled={isReviewing}
                      onClick={() => onReview(finding.id, "accepted")}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className={styles.dismissButton}
                      disabled={isReviewing}
                      onClick={() => onReview(finding.id, "dismissed")}
                    >
                      Dismiss
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
