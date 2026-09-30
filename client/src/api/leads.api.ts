import { api } from "./client";
import type { Lead, WorkflowLog } from "../types/lead";
import type { User } from "../types/auth";

export const getLeads = async (status?: string): Promise<Lead[] & { data: Lead[]; success: boolean }> => {
  const query = status ? `?status=${status}` : "";
  const res = await api<{ success: boolean; data: { leads?: Lead[] } & Lead[] }>(`/leads${query}`);
  const leads: any = res.data?.leads || (Array.isArray(res.data) ? res.data : []);
  leads.data = leads;
  leads.success = true;
  return leads;
};

export const getLeadById = async (id: string): Promise<Lead & { data: Lead; success: boolean }> => {
  const res = await api<{ success: boolean; data: { lead?: Lead } & Lead }>(`/leads/${id}`);
  const lead: any = res.data?.lead || res.data;
  if (lead) {
    lead.data = lead;
    lead.success = true;
  }
  return lead;
};

export const createLead = async (data: { name: string; contactNumber: string }): Promise<Lead & { data: Lead; success: boolean; message: string }> => {
  const res = await api<{ success: boolean; message?: string; data: { lead?: Lead } & Lead }>("/leads", {
    method: "POST",
    body: JSON.stringify(data),
  });
  const lead: any = res.data?.lead || res.data;
  if (lead) {
    lead.data = lead;
    lead.success = true;
    lead.message = res.message || "Lead created successfully";
  }
  return lead;
};

export const markMeeting = async (
  id: string,
  data: { name: string; postalAddress: string; date: string; time: string; remark?: string }
): Promise<Lead> => {
  const res = await api<{ success: boolean; data: { lead?: Lead } & Lead }>(`/leads/${id}/meeting`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data.lead || res.data;
};

export const updateVigilance = async (
  id: string,
  data: { name: string; postalAddress: string; date: string; time: string; remark?: string }
): Promise<Lead> => {
  const res = await api<{ success: boolean; data: Lead }>(`/vigilance/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
};

export const uploadAudio = async (id: string, file: File): Promise<Lead> => {
  const formData = new FormData();
  formData.append("audio", file);
  const res = await api<{ success: boolean; data: Lead }>(`/vigilance/${id}/audio`, {
    method: "POST",
    body: formData,
  });
  return res.data;
};

export const verifyLead = async (id: string): Promise<Lead> => {
  const res = await api<{ success: boolean; data: Lead }>(`/vigilance/${id}/verify`, {
    method: "POST",
  });
  return res.data;
};

export const getSalesUsers = async (): Promise<User[]> => {
  const res = await api<{ success: boolean; data: User[] }>("/users/sales");
  return res.data || [];
};

export const allocateLead = async (id: string, assignedTo: string): Promise<Lead> => {
  const res = await api<{ success: boolean; data: Lead }>(`/support/${id}/allocate`, {
    method: "POST",
    body: JSON.stringify({ assignedTo }),
  });
  return res.data;
};

export const markAudioCompleted = async (id: string): Promise<Lead> => {
  const res = await api<{ success: boolean; data: Lead }>(`/sales/${id}/audio-completed`, {
    method: "POST",
  });
  return res.data;
};

export const claimLead = async (id: string): Promise<Lead> => {
  const res = await api<{ success: boolean; data: Lead }>(`/sales/${id}/claim`, {
    method: "POST",
  });
  return res.data;
};

export const getWorkflowLogs = async (id: string): Promise<WorkflowLog[]> => {
  const res = await api<{ success: boolean; data: { logs?: WorkflowLog[] } & WorkflowLog[] }>(`/leads/${id}/workflow`);
  return res.data.logs || (Array.isArray(res.data) ? res.data : []);
};

export interface LeadStats {
  total: number;
  pending: number;
  completed: number;
  byStatus?: {
    CREATED: number;
    MEETING: number;
    VERIFIED: number;
    ALLOCATED: number;
    CLAIMED: number;
  };
}

export const getLeadStats = async (): Promise<LeadStats> => {
  const res = await api<{ success: boolean; data: LeadStats }>("/leads/stats");
  return res.data;
};
