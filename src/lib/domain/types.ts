export const DOCUMENT_CATEGORIES = [
  "passport",
  "visa_application_form",
  "proof_of_employment",
  "bank_statement",
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export type FindingStatus = "missing" | "failed" | "uncertain" | "passed";

export type ReviewStatus = "pending" | "accepted" | "dismissed";

export type ChecklistItemStatus = "submitted" | "missing";

export interface ChecklistCriterion {
  id: string;
  description: string;
}

export interface ChecklistCategory {
  id: DocumentCategory;
  label: string;
  criteria: ChecklistCriterion[];
}

export interface CaseRecord {
  id: string;
  clientName: string;
  visaType: string;
}

export interface CaseDocument {
  id: string;
  filename: string;
  declaredCategory: DocumentCategory;
  extractedText: string;
}

export interface Finding {
  id: string;
  category: DocumentCategory;
  criterionId: string;
  status: FindingStatus;
  message: string;
  evidence: string | null;
  documentId: string | null;
  reviewStatus: ReviewStatus;
}

export interface ChecklistCategoryStatus {
  categoryId: DocumentCategory;
  label: string;
  status: ChecklistItemStatus;
  documentId: string | null;
  filename: string | null;
}

/** Stable API payload for the lawyer case view. Findings start empty in slice 1. */
export interface CaseApiResponse {
  case: CaseRecord;
  checklist: {
    categories: ChecklistCategory[];
  };
  documents: Array<{
    id: string;
    filename: string;
    declaredCategory: DocumentCategory;
  }>;
  checklistStatus: ChecklistCategoryStatus[];
  findings: Finding[];
}
