import { NextResponse } from "next/server";

import { getCaseView } from "@/lib/case/get-case-view";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getCaseView();
    return NextResponse.json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load case.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
