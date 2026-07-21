import type {
  CaseDocument,
  ChecklistCategory,
  ChecklistCategoryStatus,
} from "@/lib/domain/types";

/**
 * Derive submitted vs missing from checklist categories versus
 * documents' declared categories — not hard-coded in the UI.
 */
export function deriveChecklistStatus(
  checklistCategories: ChecklistCategory[],
  documents: CaseDocument[],
): ChecklistCategoryStatus[] {
  const byCategory = new Map(
    documents.map((document) => [document.declaredCategory, document]),
  );

  return checklistCategories.map((category) => {
    const document = byCategory.get(category.id);
    if (!document) {
      return {
        categoryId: category.id,
        label: category.label,
        status: "missing",
        documentId: null,
        filename: null,
      };
    }

    return {
      categoryId: category.id,
      label: category.label,
      status: "submitted",
      documentId: document.id,
      filename: document.filename,
    };
  });
}
