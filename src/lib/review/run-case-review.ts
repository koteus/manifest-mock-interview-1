import { DEMO_CASE_ID, VISA_CHECKLIST } from "@/lib/checklist/visa-checklist";
import { ensureDemoCaseSeeded } from "@/lib/case/seed-demo-case";
import { getCaseView } from "@/lib/case/get-case-view";
import type { CaseApiResponse } from "@/lib/domain/types";
import type { DocumentReviewer } from "@/lib/review/types";
import type { CaseRepository } from "@/lib/storage/case-repository";
import { getCaseRepository } from "@/lib/storage/in-memory-case-repository";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function runCaseReview(
  reviewer: DocumentReviewer,
  caseId: string = DEMO_CASE_ID,
  repository: CaseRepository = getCaseRepository(),
): Promise<CaseApiResponse> {
  await ensureDemoCaseSeeded(repository);

  const caseRecord = await repository.getCase(caseId);
  if (!caseRecord) {
    throw new Error(`Case ${caseId} not found.`);
  }

  const documents = await repository.listDocuments(caseId);
  const findings = await reviewer.review({
    caseRecord,
    checklist: VISA_CHECKLIST,
    documents,
    referenceDate: todayIsoDate(),
  });

  await repository.replaceFindings(caseId, findings);
  return getCaseView(caseId, repository);
}
