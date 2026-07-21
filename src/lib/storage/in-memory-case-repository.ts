import type {
  CaseDocument,
  CaseRecord,
  Finding,
  ReviewStatus,
} from "@/lib/domain/types";
import type {
  CaseRepository,
  SeededCase,
} from "@/lib/storage/case-repository";

interface CaseState {
  case: CaseRecord;
  documents: CaseDocument[];
  findings: Finding[];
}

/**
 * In-memory repository for the running Node process.
 * State survives soft navigations; lost on process restart.
 */
export class InMemoryCaseRepository implements CaseRepository {
  private readonly cases = new Map<string, CaseState>();

  async hasCase(caseId: string): Promise<boolean> {
    return this.cases.has(caseId);
  }

  async seedCase(data: SeededCase): Promise<void> {
    if (this.cases.has(data.case.id)) {
      throw new Error(
        `Case ${data.case.id} is already seeded; refusing to seed twice.`,
      );
    }

    this.cases.set(data.case.id, {
      case: data.case,
      documents: data.documents,
      findings: [],
    });
  }

  async getCase(caseId: string): Promise<CaseRecord | null> {
    return this.cases.get(caseId)?.case ?? null;
  }

  async listDocuments(caseId: string): Promise<CaseDocument[]> {
    return this.cases.get(caseId)?.documents ?? [];
  }

  async listFindings(caseId: string): Promise<Finding[]> {
    return this.cases.get(caseId)?.findings ?? [];
  }

  async replaceFindings(caseId: string, findings: Finding[]): Promise<void> {
    const state = this.cases.get(caseId);
    if (!state) {
      throw new Error(`Case ${caseId} not found.`);
    }
    state.findings = findings;
  }

  async updateFindingReviewStatus(
    caseId: string,
    findingId: string,
    reviewStatus: ReviewStatus,
  ): Promise<Finding | null> {
    const state = this.cases.get(caseId);
    if (!state) {
      return null;
    }

    const finding = state.findings.find((item) => item.id === findingId);
    if (!finding) {
      return null;
    }

    finding.reviewStatus = reviewStatus;
    return finding;
  }
}

const globalForRepo = globalThis as typeof globalThis & {
  __caseRepository?: InMemoryCaseRepository;
};

/** Module singleton so Next.js hot reload does not create a second store mid-session. */
export function getCaseRepository(): CaseRepository {
  if (!globalForRepo.__caseRepository) {
    globalForRepo.__caseRepository = new InMemoryCaseRepository();
  }
  return globalForRepo.__caseRepository;
}
