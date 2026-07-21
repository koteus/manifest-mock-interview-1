import { randomUUID } from "crypto";

import type {
  CaseDocument,
  ChecklistCategory,
  Finding,
} from "@/lib/domain/types";
import type { CriterionEvaluationStatus } from "@/lib/review/types";
import { mapEvaluationStatus } from "@/lib/review/types";

export interface CriterionEvaluation {
  criterionId: string;
  status: CriterionEvaluationStatus;
  message: string;
  evidence: string | null;
}

export function missingFindingsForCategory(
  category: ChecklistCategory,
): Finding[] {
  return category.criteria
    .filter((criterion) => criterion.id === "present")
    .map((criterion) => ({
      id: randomUUID(),
      category: category.id,
      criterionId: criterion.id,
      status: "missing" as const,
      message: `No document was submitted for required category “${category.label}”.`,
      evidence: null,
      documentId: null,
      reviewStatus: "pending" as const,
    }));
}

export function presentPassedFinding(
  category: ChecklistCategory,
  document: CaseDocument,
): Finding {
  return {
    id: randomUUID(),
    category: category.id,
    criterionId: "present",
    status: "passed",
    message: `Document “${document.filename}” was submitted for ${category.label}.`,
    evidence: null,
    documentId: document.id,
    reviewStatus: "pending",
  };
}

export function findingsFromEvaluations(
  category: ChecklistCategory,
  document: CaseDocument,
  evaluations: CriterionEvaluation[],
): Finding[] {
  return evaluations.map((evaluation) => ({
    id: randomUUID(),
    category: category.id,
    criterionId: evaluation.criterionId,
    status: mapEvaluationStatus(evaluation.status),
    message: evaluation.message,
    evidence: evaluation.evidence,
    documentId: document.id,
    reviewStatus: "pending" as const,
  }));
}
