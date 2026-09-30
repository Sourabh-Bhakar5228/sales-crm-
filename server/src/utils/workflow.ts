import { LEAD_STATUS, LeadStatus } from "../constants/leadStatus.js";

const allowedTransitions: Record<LeadStatus, LeadStatus[]> = {
  [LEAD_STATUS.CREATED]: [LEAD_STATUS.MEETING],
  [LEAD_STATUS.MEETING]: [LEAD_STATUS.VERIFIED],
  [LEAD_STATUS.VERIFIED]: [LEAD_STATUS.ALLOCATED],
  [LEAD_STATUS.ALLOCATED]: [LEAD_STATUS.CLAIMED],
  [LEAD_STATUS.CLAIMED]: [],
};

export const canTransition = (
  from: LeadStatus,
  to: LeadStatus
): boolean => {
  return allowedTransitions[from]?.includes(to) ?? false;
};
