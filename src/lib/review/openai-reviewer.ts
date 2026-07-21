import OpenAI from "openai";

import type {
  CaseDocument,
  ChecklistCategory,
  Finding,
} from "@/lib/domain/types";
import {
  findingsFromEvaluations,
  missingFindingsForCategory,
  presentPassedFinding,
  type CriterionEvaluation,
} from "@/lib/review/build-findings";
import type { DocumentReviewer, ReviewerInput } from "@/lib/review/types";

interface ModelResponse {
  evaluations: CriterionEvaluation[];
}

/** Default to GPT-5.6 Luna (cost-optimized GPT-5.6 tier). See OpenAI model docs. */
export const DEFAULT_REVIEW_MODEL = "gpt-5.6-luna";

/**
 * Structured Outputs schema for Responses API `text.format`.
 * @see https://developers.openai.com/api/docs/guides/structured-outputs
 */
const evaluationSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    evaluations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          criterionId: { type: "string" },
          status: {
            type: "string",
            enum: ["pass", "fail", "uncertain"],
          },
          message: { type: "string" },
          evidence: { type: ["string", "null"] },
        },
        required: ["criterionId", "status", "message", "evidence"],
      },
    },
  },
  required: ["evaluations"],
} as const;

export class OpenAIDocumentReviewer implements DocumentReviewer {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(
    apiKey: string,
    model = process.env.OPENAI_MODEL?.trim() || DEFAULT_REVIEW_MODEL,
  ) {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async review(input: ReviewerInput): Promise<Finding[]> {
    const documentsByCategory = new Map(
      input.documents.map((document) => [document.declaredCategory, document]),
    );

    const missingFindings: Finding[] = [];
    const submittedReviews: Array<{
      category: ChecklistCategory;
      document: CaseDocument;
    }> = [];

    for (const category of input.checklist) {
      const document = documentsByCategory.get(category.id);
      if (!document) {
        missingFindings.push(...missingFindingsForCategory(category));
        continue;
      }
      submittedReviews.push({ category, document });
    }

    const submittedFindings = await Promise.all(
      submittedReviews.map(({ category, document }) =>
        this.reviewSubmittedDocument({
          clientName: input.caseRecord.clientName,
          referenceDate: input.referenceDate,
          category,
          document,
        }),
      ),
    );

    return [...missingFindings, ...submittedFindings.flat()];
  }

  private async reviewSubmittedDocument(args: {
    clientName: string;
    referenceDate: string;
    category: ChecklistCategory;
    document: CaseDocument;
  }): Promise<Finding[]> {
    const findings: Finding[] = [
      presentPassedFinding(args.category, args.document),
    ];

    const criteriaToEvaluate = args.category.criteria.filter(
      (criterion) => criterion.id !== "present",
    );
    if (criteriaToEvaluate.length === 0) {
      return findings;
    }

    const evaluations = await this.evaluateDocument({
      clientName: args.clientName,
      referenceDate: args.referenceDate,
      category: args.category,
      document: args.document,
      criteria: criteriaToEvaluate,
    });

    findings.push(
      ...findingsFromEvaluations(args.category, args.document, evaluations),
    );
    return findings;
  }

  private async evaluateDocument(args: {
    clientName: string;
    referenceDate: string;
    category: ChecklistCategory;
    document: CaseDocument;
    criteria: ChecklistCategory["criteria"];
  }): Promise<CriterionEvaluation[]> {
    const criterionIds = args.criteria.map((criterion) => criterion.id);

    const instructions = [
      "You are assisting an immigration lawyer with document checklist review.",
      "Evaluate each criterion independently against the document text.",
      'Use status "fail" only when the document clearly fails the criterion.',
      'Use status "uncertain" when evidence is missing, ambiguous, incomplete, or not confident enough for a legal reviewer — for example ambiguous or absent dates for recency checks.',
      'Use status "pass" only when the document clearly satisfies the criterion.',
      "For each evaluation, provide a short lawyer-facing message and, when possible, a brief evidence quote copied from the document text.",
      "Return exactly one evaluation per requested criterionId; do not invent criterion ids.",
      `Reference date for recency checks: ${args.referenceDate}.`,
    ].join(" ");

    const response = await this.client.responses.create({
      model: this.model,
      instructions,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                clientName: args.clientName,
                documentCategory: args.category.id,
                documentCategoryLabel: args.category.label,
                filename: args.document.filename,
                criteria: args.criteria,
                documentText: args.document.extractedText,
              }),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "criterion_evaluations",
          strict: true,
          schema: evaluationSchema,
        },
      },
    });

    const content = response.output_text;
    if (!content) {
      throw new Error("OpenAI returned an empty review response.");
    }

    const parsed = JSON.parse(content) as ModelResponse;
    const byId = new Map(
      parsed.evaluations.map((evaluation) => [
        evaluation.criterionId,
        evaluation,
      ]),
    );

    return criterionIds.map((criterionId) => {
      const evaluation = byId.get(criterionId);
      if (!evaluation) {
        return {
          criterionId,
          status: "uncertain" as const,
          message:
            "The model did not return an evaluation for this criterion.",
          evidence: null,
        };
      }
      return evaluation;
    });
  }
}

export function createDocumentReviewer(): DocumentReviewer {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env.local and restart the server.",
    );
  }
  return new OpenAIDocumentReviewer(apiKey);
}
