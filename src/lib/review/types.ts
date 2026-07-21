import type {
  CaseDocument,
  CaseRecord,
  ChecklistCategory,
  Finding,
  FindingStatus,
} from "@/lib/domain/types";

export interface ReviewerInput {
  caseRecord: CaseRecord;
  checklist: ChecklistCategory[];
  documents: CaseDocument[];
  /** ISO date (YYYY-MM-DD) used for recency checks such as “within 90 days”. */
  referenceDate: string;
}

export interface DocumentReviewer {
  review(input: ReviewerInput): Promise<Finding[]>;
}

export type CriterionEvaluationStatus = "pass" | "fail" | "uncertain";

export function mapEvaluationStatus(
  status: CriterionEvaluationStatus,
): FindingStatus {
  switch (status) {
    case "pass":
      return "passed";
    case "fail":
      return "failed";
    case "uncertain":
      return "uncertain";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}
