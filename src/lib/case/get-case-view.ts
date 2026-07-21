import { VISA_CHECKLIST, DEMO_CASE_ID } from "@/lib/checklist/visa-checklist";
import { deriveChecklistStatus } from "@/lib/case/derive-checklist-status";
import { ensureDemoCaseSeeded } from "@/lib/case/seed-demo-case";
import type { CaseApiResponse } from "@/lib/domain/types";
import type { CaseRepository } from "@/lib/storage/case-repository";
import { getCaseRepository } from "@/lib/storage/in-memory-case-repository";

export async function getCaseView(
  caseId: string = DEMO_CASE_ID,
  repository: CaseRepository = getCaseRepository(),
): Promise<CaseApiResponse> {
  await ensureDemoCaseSeeded(repository);

  const caseRecord = await repository.getCase(caseId);
  if (!caseRecord) {
    throw new Error(`Case ${caseId} not found after seeding.`);
  }

  const documents = await repository.listDocuments(caseId);
  const findings = await repository.listFindings(caseId);

  return {
    case: caseRecord,
    checklist: {
      categories: VISA_CHECKLIST,
    },
    documents: documents.map((document) => ({
      id: document.id,
      filename: document.filename,
      declaredCategory: document.declaredCategory,
    })),
    checklistStatus: deriveChecklistStatus(VISA_CHECKLIST, documents),
    findings,
  };
}
