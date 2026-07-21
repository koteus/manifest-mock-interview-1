import { promises as fs } from "fs";
import path from "path";

import {
  DOCUMENT_CATEGORIES,
  type DocumentCategory,
} from "@/lib/domain/types";
import type {
  CaseSubmission,
  DocumentSource,
  DocumentSourcePayload,
} from "@/lib/documents/document-source";

interface CaseManifestDocument {
  filename: string;
  declaredCategory: string;
}

interface CaseManifest {
  id: string;
  clientName: string;
  visaType: string;
  documents: CaseManifestDocument[];
}

function isDocumentCategory(value: string): value is DocumentCategory {
  return (DOCUMENT_CATEGORIES as readonly string[]).includes(value);
}

export class DirectoryDocumentSource implements DocumentSource {
  constructor(private readonly casesRoot: string) {}

  async loadSubmission(caseId: string): Promise<CaseSubmission> {
    const caseDir = path.join(this.casesRoot, caseId);
    const manifestPath = path.join(caseDir, "case.json");
    const raw = await fs.readFile(manifestPath, "utf8");
    const manifest = JSON.parse(raw) as CaseManifest;

    if (manifest.id !== caseId) {
      throw new Error(
        `Case id mismatch: directory ${caseId} has manifest id ${manifest.id}.`,
      );
    }

    const documents: DocumentSourcePayload[] = [];
    const seenCategories = new Set<DocumentCategory>();

    for (const entry of manifest.documents) {
      if (!isDocumentCategory(entry.declaredCategory)) {
        throw new Error(
          `Unknown declared category "${entry.declaredCategory}" for ${entry.filename}.`,
        );
      }

      if (seenCategories.has(entry.declaredCategory)) {
        throw new Error(
          `Each file must map to exactly one unique checklist category; duplicate category "${entry.declaredCategory}".`,
        );
      }
      seenCategories.add(entry.declaredCategory);

      const filePath = path.join(caseDir, "documents", entry.filename);
      const bytes = await fs.readFile(filePath);

      documents.push({
        filename: entry.filename,
        declaredCategory: entry.declaredCategory,
        bytes,
      });
    }

    return {
      case: {
        id: manifest.id,
        clientName: manifest.clientName,
        visaType: manifest.visaType,
      },
      documents,
    };
  }
}
