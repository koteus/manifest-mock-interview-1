import type { ChecklistCategory } from "@/lib/domain/types";

/**
 * Fixed MVP checklist for a single visa type.
 * Kept as data so it can be replaced later without scattering rules in UI logic.
 */
export const VISA_CHECKLIST: ChecklistCategory[] = [
  {
    id: "passport",
    label: "Passport",
    criteria: [
      { id: "present", description: "Must be present." },
      { id: "not_expired", description: "Must not be expired." },
      {
        id: "name_matches_client",
        description: "The holder’s name should match the client’s name.",
      },
      {
        id: "passport_number_readable",
        description: "The passport number should be readable.",
      },
    ],
  },
  {
    id: "visa_application_form",
    label: "Visa application form",
    criteria: [
      { id: "present", description: "Must be present." },
      { id: "signed", description: "Must be signed." },
      {
        id: "name_matches_client",
        description: "The applicant’s name should match the client’s name.",
      },
      {
        id: "required_fields_complete",
        description: "Required fields should not be empty.",
      },
    ],
  },
  {
    id: "proof_of_employment",
    label: "Proof of employment",
    criteria: [
      { id: "present", description: "Must be present." },
      {
        id: "employer_name_present",
        description: "Should contain the employer’s name.",
      },
      {
        id: "applicant_name_present",
        description: "Should contain the applicant’s name.",
      },
      {
        id: "dated_within_90_days",
        description: "Should be dated within the last 90 days.",
      },
    ],
  },
  {
    id: "bank_statement",
    label: "Bank statement",
    criteria: [
      { id: "present", description: "Must be present." },
      {
        id: "applicant_name_present",
        description: "Should contain the applicant’s name.",
      },
      {
        id: "dated_within_90_days",
        description: "Should be dated within the last 90 days.",
      },
      {
        id: "account_balance_visible",
        description: "The document should contain at least one visible account balance.",
      },
    ],
  },
];

export const DEMO_CASE_ID = "demo-case";
