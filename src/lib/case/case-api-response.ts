import { z } from "zod";

import { DOCUMENT_CATEGORIES } from "@/lib/domain/types";
import type { CaseApiResponse } from "@/lib/domain/types";

const documentCategorySchema = z.enum(DOCUMENT_CATEGORIES);

const findingStatusSchema = z.enum([
  "missing",
  "failed",
  "uncertain",
  "passed",
]);

const reviewStatusSchema = z.enum(["pending", "accepted", "dismissed"]);

const checklistItemStatusSchema = z.enum(["submitted", "missing"]);

export const caseApiResponseSchema = z.object({
  case: z.object({
    id: z.string(),
    clientName: z.string(),
    visaType: z.string(),
  }),
  checklist: z.object({
    categories: z.array(
      z.object({
        id: documentCategorySchema,
        label: z.string(),
        criteria: z.array(
          z.object({
            id: z.string(),
            description: z.string(),
          }),
        ),
      }),
    ),
  }),
  documents: z.array(
    z.object({
      id: z.string(),
      filename: z.string(),
      declaredCategory: documentCategorySchema,
    }),
  ),
  checklistStatus: z.array(
    z.object({
      categoryId: documentCategorySchema,
      label: z.string(),
      status: checklistItemStatusSchema,
      documentId: z.string().nullable(),
      filename: z.string().nullable(),
    }),
  ),
  findings: z.array(
    z.object({
      id: z.string(),
      category: documentCategorySchema,
      criterionId: z.string(),
      status: findingStatusSchema,
      message: z.string(),
      evidence: z.string().nullable(),
      documentId: z.string().nullable(),
      reviewStatus: reviewStatusSchema,
    }),
  ),
});

export function parseCaseApiResponse(data: unknown): CaseApiResponse {
  return caseApiResponseSchema.parse(data);
}
