import { randomUUID } from "crypto";
import path from "path";

import { DEMO_CASE_ID } from "@/lib/checklist/visa-checklist";
import { DirectoryDocumentSource } from "@/lib/documents/directory-document-source";
import { PlainTextExtractor } from "@/lib/extraction/plain-text-extractor";
import type { CaseDocument } from "@/lib/domain/types";
import type { CaseRepository } from "@/lib/storage/case-repository";
import { getCaseRepository } from "@/lib/storage/in-memory-case-repository";

function samplesRoot(): string {
  return path.join(process.cwd(), "samples", "cases");
}

/**
 * Ensures the demo case is loaded into the repository exactly once per process.
 */
export async function ensureDemoCaseSeeded(
  repository: CaseRepository = getCaseRepository(),
): Promise<void> {
  if (await repository.hasCase(DEMO_CASE_ID)) {
    return;
  }

  const source = new DirectoryDocumentSource(samplesRoot());
  const extractor = new PlainTextExtractor();
  const submission = await source.loadSubmission(DEMO_CASE_ID);

  const documents: CaseDocument[] = [];
  for (const doc of submission.documents) {
    const extractedText = await extractor.extract({
      filename: doc.filename,
      bytes: doc.bytes,
    });

    documents.push({
      id: randomUUID(),
      filename: doc.filename,
      declaredCategory: doc.declaredCategory,
      extractedText,
    });
  }

  await repository.seedCase({
    case: submission.case,
    documents,
  });
}
