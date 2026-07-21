"use client";

import { useMemo, useState, useTransition } from "react";

import {
  CaseApiError,
  fetchCaseView,
  readCaseApiResponse,
} from "@/lib/case/fetch-case-view";
import { buildCategoryLabelLookup } from "@/lib/case/category-labels";
import { buildCriterionLabelLookup } from "@/lib/case/criterion-labels";
import {
  ATTENTION_FINDING_STATUSES,
  countPendingAttentionFindings,
  groupFindingsByStatus,
} from "@/lib/case/group-findings";
import type {
  CaseApiResponse,
  ChecklistCategory,
  Finding,
  LawyerReviewDecision,
} from "@/lib/domain/types";
import { FindingGroup } from "./FindingGroup";
import styles from "../page.module.css";

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
  const [reviewingFindingId, setReviewingFindingId] = useState<string | null>(
    null,
  );
  const [isReviewPending, startReviewTransition] = useTransition();
  const [isRunPending, startRunTransition] = useTransition();

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
  const pendingAttentionCount = useMemo(
    () => countPendingAttentionFindings(findings),
    [findings],
  );

  const hasReviewedFindings = useMemo(
    () => findings.some((finding) => finding.reviewStatus !== "pending"),
    [findings],
  );

  function applyFindingsFromView(view: CaseApiResponse) {
    setFindings(view.findings);
  }

  async function refreshFindings() {
    const view = await fetchCaseView();
    applyFindingsFromView(view);
  }

  function runReview() {
    if (
      hasReviewedFindings &&
      !window.confirm(
        "Re-running AI review will replace the current findings and clear your accept/dismiss decisions. Continue?",
      )
    ) {
      return;
    }

    setError(null);
    startRunTransition(async () => {
      try {
        const response = await fetch("/api/review/run", { method: "POST" });
        const view = await readCaseApiResponse(response);
        applyFindingsFromView(view);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Review request failed.");
      }
    });
  }

  function reviewFinding(findingId: string, reviewStatus: LawyerReviewDecision) {
    setError(null);
    setReviewingFindingId(findingId);
    startReviewTransition(async () => {
      try {
        const response = await fetch(`/api/findings/${findingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reviewStatus }),
        });
        const view = await readCaseApiResponse(response);
        applyFindingsFromView(view);
      } catch (err) {
        if (
          err instanceof CaseApiError &&
          (err.status === 404 || err.status === 409)
        ) {
          try {
            await refreshFindings();
          } catch {
            // Fall through to show the original error.
          }
        }
        setError(
          err instanceof Error ? err.message : "Failed to update finding.",
        );
      } finally {
        setReviewingFindingId(null);
      }
    });
  }

  const isBusy = isReviewPending || isRunPending;

  return (
    <section className={styles.section} aria-labelledby="findings-heading">
      <h2 id="findings-heading" className={styles.sectionTitle}>
        AI findings
      </h2>
      <p className={styles.sectionLead}>
        Grouped as missing, failed, or uncertain. Accept or dismiss each finding
        to record your review for this session.
      </p>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={runReview}
          disabled={isBusy}
        >
          {isRunPending
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
            {pendingAttentionCount} issue
            {pendingAttentionCount === 1 ? "" : "s"} still needing your review.
          </p>
          {ATTENTION_FINDING_STATUSES.map((status) => (
            <FindingGroup
              key={status}
              title={status.charAt(0).toUpperCase() + status.slice(1)}
              findings={groupedFindings[status]}
              documents={documents}
              categoryLabels={categoryLabels}
              criterionLabel={criterionLabel}
              reviewingFindingId={reviewingFindingId}
              onReview={reviewFinding}
            />
          ))}
        </>
      )}
    </section>
  );
}
