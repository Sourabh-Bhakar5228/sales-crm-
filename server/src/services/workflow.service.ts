import mongoose from "mongoose";
import { WorkflowLog } from "../models/WorkflowLog.js";
import { LeadStatus } from "../constants/leadStatus.js";
import { WorkflowAction } from "../constants/workflowActions.js";
import { Role } from "../constants/roles.js";

export interface CreateWorkflowLogParams {
  leadId: mongoose.Types.ObjectId;
  action: WorkflowAction;
  fromStatus?: LeadStatus | null;
  toStatus?: LeadStatus | null;
  performedBy: mongoose.Types.ObjectId;
  performedByRole: Role;
  metadata?: Record<string, unknown>;
}

export const createWorkflowLog = async (
  params: CreateWorkflowLogParams
) => {
  return WorkflowLog.create(params);
};

export const getWorkflowLogsForLead = async (leadId: string) => {
  return WorkflowLog.find({ leadId: new mongoose.Types.ObjectId(leadId) })
    .sort({ createdAt: 1 })
    .populate("performedBy", "name email role")
    .lean();
};

export class WorkflowService {
  static createWorkflowLog = createWorkflowLog;
  static getLogsForLead = getWorkflowLogsForLead;
  static logTransition = async (params: {
    leadId: mongoose.Types.ObjectId | string;
    action: WorkflowAction;
    fromStatus: LeadStatus | null;
    toStatus: LeadStatus;
    performedBy: mongoose.Types.ObjectId | string;
    performedByRole: Role;
    metadata?: Record<string, unknown>;
  }) => {
    return createWorkflowLog({
      leadId: new mongoose.Types.ObjectId(params.leadId),
      action: params.action,
      fromStatus: params.fromStatus,
      toStatus: params.toStatus,
      performedBy: new mongoose.Types.ObjectId(params.performedBy),
      performedByRole: params.performedByRole,
      metadata: params.metadata,
    });
  };
}
