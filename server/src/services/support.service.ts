import { Types } from "mongoose";
import { Lead } from "../models/Lead.js";
import { User } from "../models/User.js";
import { LEAD_STATUS } from "../constants/leadStatus.js";
import { ROLES } from "../constants/roles.js";
import { WORKFLOW_ACTIONS } from "../constants/workflowActions.js";
import { canTransition } from "../utils/workflow.js";
import { createWorkflowLog } from "./workflow.service.js";

export const allocateLead = async (
  leadId: string,
  salesUserId: string,
  supportUserId: string
) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new Error("Lead not found");
  }

  // State validation
  if (!canTransition(lead.status, LEAD_STATUS.ALLOCATED)) {
    throw new Error(
      `Lead cannot be allocated from ${lead.status} state`
    );
  }

  // Required support verification
  if (!lead.date) {
    throw new Error("Date is required before allocation");
  }

  if (!lead.time) {
    throw new Error("Time is required before allocation");
  }

  if (!lead.postalAddress?.trim()) {
    throw new Error(
      "Complete postal address is required before allocation"
    );
  }

  // Validate selected Sales user
  let salesObjectId: Types.ObjectId;
  try {
    salesObjectId = new Types.ObjectId(salesUserId);
  } catch {
    throw new Error("Invalid or inactive Sales user");
  }

  const salesUser = await User.findOne({
    _id: salesObjectId,
    role: ROLES.SALES,
    isActive: true,
  });

  if (!salesUser) {
    throw new Error("Invalid or inactive Sales user");
  }

  const previousStatus = lead.status;

  lead.assignedTo = salesUser._id as Types.ObjectId;
  lead.status = LEAD_STATUS.ALLOCATED;

  await lead.save();

  await createWorkflowLog({
    leadId: lead._id as Types.ObjectId,
    action: WORKFLOW_ACTIONS.ALLOCATE_LEAD,
    fromStatus: previousStatus,
    toStatus: LEAD_STATUS.ALLOCATED,
    performedBy: new Types.ObjectId(supportUserId),
    performedByRole: ROLES.SUPPORT,
    metadata: {
      assignedTo: salesUser._id,
    },
  });

  return lead;
};
