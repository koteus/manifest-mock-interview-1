import { runCaseReview } from "../src/lib/review/run-case-review";
import { createDocumentReviewer } from "../src/lib/review/openai-reviewer";
import { InMemoryCaseRepository } from "../src/lib/storage/in-memory-case-repository";

async function main() {
  const repo = new InMemoryCaseRepository();
  const view = await runCaseReview(createDocumentReviewer(), "demo-case", repo);
  const counts = view.findings.reduce<Record<string, number>>((acc, finding) => {
    acc[finding.status] = (acc[finding.status] ?? 0) + 1;
    return acc;
  }, {});

  console.log("model ok");
  console.log("finding counts:", counts);
  console.log(
    "sample attention:",
    view.findings
      .filter((finding) => finding.status !== "passed")
      .slice(0, 4)
      .map((finding) => ({
        status: finding.status,
        category: finding.category,
        criterionId: finding.criterionId,
        hasEvidence: Boolean(finding.evidence),
      })),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
