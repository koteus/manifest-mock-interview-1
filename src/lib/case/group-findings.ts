import type { Finding, FindingStatus } from "@/lib/domain/types";

export const ATTENTION_FINDING_STATUSES = [
  "missing",
  "failed",
  "uncertain",
] as const satisfies readonly FindingStatus[];

export type AttentionFindingStatus = (typeof ATTENTION_FINDING_STATUSES)[number];

export function groupFindingsByStatus(
  findings: Finding[],
): Record<FindingStatus, Finding[]> {
  const grouped: Record<FindingStatus, Finding[]> = {
    missing: [],
    failed: [],
    uncertain: [],
    passed: [],
  };

  for (const finding of findings) {
    grouped[finding.status].push(finding);
  }

  return grouped;
}

export function countAttentionFindings(findings: Finding[]): number {
  return findings.filter((finding) =>
    ATTENTION_FINDING_STATUSES.includes(
      finding.status as AttentionFindingStatus,
    ),
  ).length;
}
