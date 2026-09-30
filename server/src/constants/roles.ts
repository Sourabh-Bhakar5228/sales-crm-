export const ROLES = {
  MARKETING: "MARKETING",
  COMMUNICATION: "COMMUNICATION",
  VIGILANCE: "VIGILANCE",
  SUPPORT: "SUPPORT",
  SALES: "SALES",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
