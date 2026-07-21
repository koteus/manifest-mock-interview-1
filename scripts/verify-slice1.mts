import assert from "node:assert/strict";
import path from "node:path";

import { DEMO_CASE_ID, VISA_CHECKLIST } from "../src/lib/checklist/visa-checklist";
import { deriveChecklistStatus } from "../src/lib/case/derive-checklist-status";
import { ensureDemoCaseSeeded } from "../src/lib/case/seed-demo-case";
import { getCaseView } from "../src/lib/case/get-case-view";
import { DirectoryDocumentSource } from "../src/lib/documents/directory-document-source";
import { InMemoryCaseRepository } from "../src/lib/storage/in-memory-case-repository";

async function main() {
  const repository = new InMemoryCaseRepository();

  await ensureDemoCaseSeeded(repository);
  const docsAfterFirst = await repository.listDocuments(DEMO_CASE_ID);
  const idsAfterFirst = docsAfterFirst.map((doc) => doc.id).sort();

  await ensureDemoCaseSeeded(repository);
  const docsAfterSecond = await repository.listDocuments(DEMO_CASE_ID);
  const idsAfterSecond = docsAfterSecond.map((doc) => doc.id).sort();

  assert.deepEqual(
    idsAfterSecond,
    idsAfterFirst,
    "Case must be seeded only once (document ids must stay stable).",
  );

  let seedRejected = false;
  try {
    await repository.seedCase({
      case: {
        id: DEMO_CASE_ID,
        clientName: "Other",
        visaType: "X",
      },
      documents: [],
    });
  } catch {
    seedRejected = true;
  }
  assert.equal(seedRejected, true, "Direct double-seed must throw.");

  const categories = docsAfterFirst.map((doc) => doc.declaredCategory);
  assert.equal(
    new Set(categories).size,
    categories.length,
    "Each file must map to exactly one unique declared category.",
  );
  assert.equal(categories.length, 3);

  const status = deriveChecklistStatus(VISA_CHECKLIST, docsAfterFirst);
  const missing = status.filter((item) => item.status === "missing");
  const submitted = status.filter((item) => item.status === "submitted");

  assert.equal(submitted.length, 3);
  assert.equal(missing.length, 1);
  assert.equal(missing[0]?.categoryId, "bank_statement");
  assert.ok(
    !missing.some((item) => item.categoryId === "passport"),
    "Missing must be derived from checklist vs submitted categories.",
  );

  const source = new DirectoryDocumentSource(
    path.join(process.cwd(), "samples", "cases"),
  );
  const submission = await source.loadSubmission(DEMO_CASE_ID);
  assert.equal(submission.case.clientName, "Jordan Lee");
  assert.equal(submission.documents.length, 3);

  const view = await getCaseView(DEMO_CASE_ID, repository);
  assert.ok(Array.isArray(view.findings), "API shape includes findings array.");
  assert.equal(view.findings.length, 0);
  assert.ok(view.case);
  assert.ok(view.checklist);
  assert.ok(view.documents);
  assert.ok(view.checklistStatus);
  assert.deepEqual(
    Object.keys(view).sort(),
    ["case", "checklist", "checklistStatus", "documents", "findings"].sort(),
  );

  console.log("Slice 1 verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
