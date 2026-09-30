import { api } from "./client";
import type { Lead } from "../types/lead";

interface LeadResponse {
  success: boolean;
  message: string;
  data: Lead;
}

export const markAudioCompleted = (leadId: string) => {
  return api<LeadResponse>(`/sales/${leadId}/audio-completed`, {
    method: "POST",
  });
};

export const claimLead = (leadId: string) => {
  return api<LeadResponse>(`/sales/${leadId}/claim`, {
    method: "POST",
  });
};
