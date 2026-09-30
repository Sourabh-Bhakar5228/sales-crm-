import { api } from "./client";
import type { Lead } from "../types/lead";

interface LeadResponse {
  success: boolean;
  message: string;
  data: Lead;
}

export interface SalesUser {
  _id: string;
  name: string;
  email: string;
  role: "SALES";
}

interface SalesUsersResponse {
  success: boolean;
  data: SalesUser[];
}

export const getSalesUsers = () => {
  return api<SalesUsersResponse>("/users/sales");
};

export const allocateLead = (
  leadId: string,
  assignedTo: string
) => {
  return api<LeadResponse>(`/support/${leadId}/allocate`, {
    method: "POST",
    body: JSON.stringify({
      assignedTo,
    }),
  });
};
