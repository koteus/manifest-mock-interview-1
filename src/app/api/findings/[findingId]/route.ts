import { NextResponse } from "next/server";

import { getCaseView } from "@/lib/case/get-case-view";
import { ensureDemoCaseSeeded } from "@/lib/case/seed-demo-case";
import { DEMO_CASE_ID } from "@/lib/checklist/visa-checklist";
import { isLawyerReviewDecision } from "@/lib/domain/types";
import { getCaseRepository } from "@/lib/storage/in-memory-case-repository";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ findingId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { findingId } = await context.params;
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("reviewStatus" in body) ||
      typeof body.reviewStatus !== "string" ||
      !isLawyerReviewDecision(body.reviewStatus)
    ) {
      return NextResponse.json(
        { error: 'reviewStatus must be "accepted" or "dismissed".' },
        { status: 400 },
      );
    }

    const repository = getCaseRepository();
    await ensureDemoCaseSeeded(repository);

    const result = await repository.updateFindingReviewStatus(
      DEMO_CASE_ID,
      findingId,
      body.reviewStatus,
    );

    switch (result.kind) {
      case "updated":
        return NextResponse.json(await getCaseView(DEMO_CASE_ID, repository));
      case "case_not_found":
      case "finding_not_found":
        return NextResponse.json(
          { error: "Finding not found." },
          { status: 404 },
        );
      case "already_reviewed":
        return NextResponse.json(
          { error: "This finding has already been reviewed." },
          { status: 409 },
        );
      default: {
        const exhaustive: never = result;
        return exhaustive;
      }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update finding.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
