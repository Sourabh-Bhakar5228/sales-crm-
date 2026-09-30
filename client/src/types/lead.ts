import type { User, Role } from "./auth";

export type LeadStatus =
  | "CREATED"
  | "MEETING"
  | "VERIFIED"
  | "ALLOCATED"
  | "CLAIMED";

export interface LeadAudio {
  url: string;
  publicId: string;
  fileName: string;
  mimeType: string;
  duration?: number;
  uploadedAt: string;
  uploadedBy: string | User;
}

export interface WorkflowLog {
  _id: string;
  leadId: string;
  action: string;
  fromStatus: string | null;
  toStatus: string;
  performedBy: string | User;
  performedByRole: Role;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Lead {
  _id: string;
  name: string;
  contactNumber: string;
  postalAddress?: string;
  date?: string;
  time?: string;
  remark?: string;
  status: LeadStatus;
  audio?: LeadAudio;
  audioCompletedAt?: string | null;
  createdBy: string | User;
  assignedTo?: string | User;
  claimedBy?: string | User;
  claimedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
