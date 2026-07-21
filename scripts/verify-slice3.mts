import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { getCaseView } from "../src/lib/case/get-case-view";
import { ensureDemoCaseSeeded } from "../src/lib/case/seed-demo-case";
import { countPendingAttentionFindings } from "../src/lib/case/group-findings";
import type { DocumentReviewer } from "../src/lib/review/types";
import { runCaseReview } from "../src/lib/review/run-case-review";
import { InMemoryCaseRepository } from "../src/lib/storage/in-memory-case-repository";

const stubReviewer: DocumentReviewer = {
  async review() {
    return [
      {
        id: randomUUID(),
        category: "bank_statement",
        criterionId: "present",
        status: "missing",
        message: "Stub missing bank statement finding.",
        evidence: null,
        documentId: null,
        reviewStatus: "pending",
      },
      {
        id: randomUUID(),
        category: "passport",
        criterionId: "not_expired",
        status: "failed",
        message: "Stub failed passport finding.",
        evidence: "Date of Expiry: 01 JAN 2024",
        documentId: null,
        reviewStatus: "pending",
      },
    ];
  },
};

async function main() {
  const repo = new InMemoryCaseRepository();
  await ensureDemoCaseSeeded(repo);

  const view = await runCaseReview(stubReviewer, "demo-case", repo);
  assert.ok(view.findings.length > 0, "Expected findings after review.");

  const pendingBefore = countPendingAttentionFindings(view.findings);
  assert.ok(pendingBefore > 0, "Expected pending attention findings.");

  const attention = view.findings.find(
    (finding) =>
      finding.status !== "passed" && finding.reviewStatus === "pending",
  );
  assert.ok(attention, "Expected a pending attention finding.");

  const accept = await repo.updateFindingReviewStatus(
    "demo-case",
    attention.id,
    "accepted",
  );
  assert.equal(accept.kind, "updated");

  const afterAcceptView = await getCaseView("demo-case", repo);
  const afterAccept = afterAcceptView.findings.find(
    (finding) => finding.id === attention.id,
  );
  assert.equal(afterAccept?.reviewStatus, "accepted");

  const duplicate = await repo.updateFindingReviewStatus(
    "demo-case",
    attention.id,
    "dismissed",
  );
  assert.equal(duplicate.kind, "already_reviewed");

  const stale = await repo.updateFindingReviewStatus(
    "demo-case",
    "00000000-0000-0000-0000-000000000000",
    "accepted",
  );
  assert.equal(stale.kind, "finding_not_found");

  assert.ok(
    countPendingAttentionFindings(afterAcceptView.findings) < pendingBefore,
    "Pending attention count should decrease after accept.",
  );

  const rerun = await runCaseReview(stubReviewer, "demo-case", repo);
  assert.ok(
    rerun.findings.every((finding) => finding.reviewStatus === "pending"),
    "Re-run should reset all findings to pending.",
  );

  console.log("Slice 3 verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
