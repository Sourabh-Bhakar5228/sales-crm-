import { api } from "./client";
import type { Lead } from "../types/lead";

interface LeadResponse {
  success: boolean;
  message: string;
  data: Lead;
}

export interface VigilanceInput {
  name: string;
  postalAddress: string;
  date: string;
  time: string;
  remark?: string;
}

export const updateVigilanceLead = (
  leadId: string,
  data: VigilanceInput
) => {
  return api<LeadResponse>(
    `/vigilance/${leadId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
};

export const uploadLeadAudio = (
  leadId: string,
  file: File
) => {
  const formData = new FormData();
  formData.append("audio", file);

  return api<LeadResponse>(
    `/vigilance/${leadId}/audio`,
    {
      method: "POST",
      body: formData,
    }
  );
};

export const verifyLead = (
  leadId: string
) => {
  return api<LeadResponse>(
    `/vigilance/${leadId}/verify`,
    {
      method: "POST",
    }
  );
};
