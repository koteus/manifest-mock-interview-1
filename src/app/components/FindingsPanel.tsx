"use client";

import { useMemo, useState, useTransition } from "react";

import { parseCaseApiResponse } from "@/lib/case/case-api-response";
import { buildCategoryLabelLookup, categoryLabel } from "@/lib/case/category-labels";
import { buildCriterionLabelLookup } from "@/lib/case/criterion-labels";
import {
  ATTENTION_FINDING_STATUSES,
  countAttentionFindings,
  groupFindingsByStatus,
} from "@/lib/case/group-findings";
import type {
  CaseApiResponse,
  ChecklistCategory,
  DocumentCategory,
  Finding,
  FindingStatus,
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

function badgeClass(status: FindingStatus): string {
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

function FindingGroup({
  title,
  findings,
  documents,
  categoryLabels,
  criterionLabel,
}: {
  title: string;
  findings: Finding[];
  documents: CaseApiResponse["documents"];
  categoryLabels: Map<DocumentCategory, string>;
  criterionLabel: (categoryId: DocumentCategory, criterionId: string) => string;
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
                  <span
                    className={`${styles.badge} ${badgeClass(finding.status)}`}
                  >
                    {finding.status}
                  </span>
                </div>
                <p className={styles.findingMessage}>{finding.message}</p>
                {finding.evidence ? (
                  <blockquote className={styles.evidence}>
                    {finding.evidence}
                  </blockquote>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function FindingsPanel({
  initialFindings,
  documents,
  checklistCategories,
}: {
  initialFindings: Finding[];
  documents: CaseApiResponse["documents"];
  checklistCategories: ChecklistCategory[];
}) {
  const [findings, setFindings] = useState(initialFindings);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const categoryLabels = useMemo(
    () => buildCategoryLabelLookup(checklistCategories),
    [checklistCategories],
  );
  const criterionLabel = useMemo(
    () => buildCriterionLabelLookup(checklistCategories),
    [checklistCategories],
  );

  const groupedFindings = useMemo(
    () => groupFindingsByStatus(findings),
    [findings],
  );
  const attentionCount = useMemo(
    () => countAttentionFindings(findings),
    [findings],
  );

  function runReview() {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/review/run", { method: "POST" });
        const payload: unknown = await response.json();

        if (!response.ok) {
          const message =
            typeof payload === "object" &&
            payload !== null &&
            "error" in payload &&
            typeof payload.error === "string"
              ? payload.error
              : "Review request failed.";
          throw new Error(message);
        }

        const parsed = parseCaseApiResponse(payload);
        setFindings(parsed.findings);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Review request failed.");
      }
    });
  }

  return (
    <section className={styles.section} aria-labelledby="findings-heading">
      <h2 id="findings-heading" className={styles.sectionTitle}>
        AI findings
      </h2>
      <p className={styles.sectionLead}>
        Grouped as missing, failed, or uncertain. Passed checks are kept in the
        API response but hidden here so the lawyer can focus on issues.
      </p>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={runReview}
          disabled={isPending}
        >
          {isPending
            ? "Running AI review…"
            : findings.length > 0
              ? "Re-run AI review"
              : "Run AI review"}
        </button>
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}

      {findings.length === 0 ? (
        <div className={styles.findingsPlaceholder}>
          No findings yet. Run AI review to evaluate the submission.
        </div>
      ) : (
        <>
          <p className={styles.sectionLead}>
            {attentionCount} issue{attentionCount === 1 ? "" : "s"} needing
            attention.
          </p>
          {ATTENTION_FINDING_STATUSES.map((status) => (
            <FindingGroup
              key={status}
              title={status.charAt(0).toUpperCase() + status.slice(1)}
              findings={groupedFindings[status]}
              documents={documents}
              categoryLabels={categoryLabels}
              criterionLabel={criterionLabel}
            />
          ))}
        </>
      )}
    </section>
  );
}
