import type {
  CaseDocument,
  CaseRecord,
  Finding,
  LawyerReviewDecision,
  UpdateFindingReviewResult,
} from "@/lib/domain/types";

export interface SeededCase {
  case: CaseRecord;
  documents: CaseDocument[];
}

/**
 * Session-scoped case storage. Application logic depends on this interface,
 * not on the in-memory implementation.
 */
export interface CaseRepository {
  hasCase(caseId: string): Promise<boolean>;
  seedCase(data: SeededCase): Promise<void>;
  getCase(caseId: string): Promise<CaseRecord | null>;
  listDocuments(caseId: string): Promise<CaseDocument[]>;
  listFindings(caseId: string): Promise<Finding[]>;
  replaceFindings(caseId: string, findings: Finding[]): Promise<void>;
  updateFindingReviewStatus(
    caseId: string,
    findingId: string,
    reviewStatus: LawyerReviewDecision,
  ): Promise<UpdateFindingReviewResult>;
}
