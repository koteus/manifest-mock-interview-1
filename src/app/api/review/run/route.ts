import { NextResponse } from "next/server";

import { runCaseReview } from "@/lib/review/run-case-review";
import { createDocumentReviewer } from "@/lib/review/openai-reviewer";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const payload = await runCaseReview(createDocumentReviewer());
    return NextResponse.json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to run AI review.";
    const status = message.includes("OPENAI_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
