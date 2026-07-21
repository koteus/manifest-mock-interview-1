import type { ChecklistCategory, DocumentCategory } from "@/lib/domain/types";

export function buildCategoryLabelLookup(
  categories: ChecklistCategory[],
): Map<DocumentCategory, string> {
  return new Map(categories.map((category) => [category.id, category.label]));
}

export function categoryLabel(
  categoryId: DocumentCategory,
  labels: Map<DocumentCategory, string>,
): string {
  return labels.get(categoryId) ?? categoryId;
}
