import type { CaseRecord, DocumentCategory } from "@/lib/domain/types";

export interface DocumentSourcePayload {
  filename: string;
  declaredCategory: DocumentCategory;
  bytes: Buffer;
}

export interface CaseSubmission {
  case: CaseRecord;
  documents: DocumentSourcePayload[];
}

/**
 * Abstraction over how a client's submission is obtained.
 * MVP: directory-backed preload. Later: uploads or external storage.
 */
export interface DocumentSource {
  loadSubmission(caseId: string): Promise<CaseSubmission>;
}
