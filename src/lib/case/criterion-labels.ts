import type { ChecklistCategory, DocumentCategory } from "@/lib/domain/types";

export type CriterionLabelLookup = (
  categoryId: DocumentCategory,
  criterionId: string,
) => string;

export function buildCriterionLabelLookup(
  categories: ChecklistCategory[],
): CriterionLabelLookup {
  const byKey = new Map<string, string>();
  for (const category of categories) {
    for (const criterion of category.criteria) {
      byKey.set(`${category.id}:${criterion.id}`, criterion.description);
    }
  }

  return (categoryId, criterionId) =>
    byKey.get(`${categoryId}:${criterionId}`) ?? criterionId;
}
