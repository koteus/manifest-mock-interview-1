import { parseCaseApiResponse } from "@/lib/case/case-api-response";
import type { CaseApiResponse } from "@/lib/domain/types";

export class CaseApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "CaseApiError";
  }
}

function errorMessage(payload: unknown, fallback: string): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }
  return fallback;
}

/** Parse a case API response, throwing {@link CaseApiError} with HTTP status on failure. */
export async function readCaseApiResponse(
  response: Response,
): Promise<CaseApiResponse> {
  const payload: unknown = await response.json();
  if (!response.ok) {
    throw new CaseApiError(
      errorMessage(payload, "Request failed."),
      response.status,
    );
  }
  return parseCaseApiResponse(payload);
}

export async function fetchCaseView(): Promise<CaseApiResponse> {
  const response = await fetch("/api/case");
  return readCaseApiResponse(response);
}
