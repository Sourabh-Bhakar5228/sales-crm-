import { api } from "./client";
import type { Lead } from "../types/lead";

interface LeadResponse {
  success: boolean;
  message: string;
  data: Lead;
}

export interface MeetingInput {
  name: string;
  postalAddress: string;
  date: string;
  time: string;
  remark?: string;
}

export const markMeeting = (
  leadId: string,
  data: MeetingInput
) => {
  return api<LeadResponse>(
    `/leads/${leadId}/meeting`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
};
