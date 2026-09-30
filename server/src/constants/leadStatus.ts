export const LEAD_STATUS = {
  CREATED: "CREATED",
  MEETING: "MEETING",
  VERIFIED: "VERIFIED",
  ALLOCATED: "ALLOCATED",
  CLAIMED: "CLAIMED",
} as const;

export type LeadStatus =
  (typeof LEAD_STATUS)[keyof typeof LEAD_STATUS];
