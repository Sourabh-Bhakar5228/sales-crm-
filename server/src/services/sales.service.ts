import { Types } from "mongoose";
import { Lead } from "../models/Lead.js";
import { LEAD_STATUS } from "../constants/leadStatus.js";
import { WORKFLOW_ACTIONS } from "../constants/workflowActions.js";
import { createWorkflowLog } from "./workflow.service.js";

export const markAudioCompleted = async (
  leadId: string,
  salesUserId: string
) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new Error("Lead not found");
  }

  if (lead.status !== LEAD_STATUS.ALLOCATED) {
    throw new Error("Audio can only be completed for allocated leads");
  }

  if (
    !lead.assignedTo ||
    lead.assignedTo.toString() !== salesUserId
  ) {
    throw new Error("This lead is not assigned to you");
  }

  if (!lead.audio?.url) {
    throw new Error("No audio is available for this lead");
  }

  lead.audioCompletedAt = new Date();

  await lead.save();

  await createWorkflowLog({
    leadId: lead._id as Types.ObjectId,
    action: WORKFLOW_ACTIONS.AUDIO_COMPLETED,
    fromStatus: LEAD_STATUS.ALLOCATED,
    toStatus: LEAD_STATUS.ALLOCATED,
    performedBy: new Types.ObjectId(salesUserId),
    performedByRole: "SALES",
  });

  return lead;
};

export const claimLead = async (
  leadId: string,
  salesUserId: string
) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new Error("Lead not found");
  }

  if (lead.status !== LEAD_STATUS.ALLOCATED) {
    throw new Error("Only allocated leads can be claimed");
  }

  if (
    !lead.assignedTo ||
    lead.assignedTo.toString() !== salesUserId
  ) {
    throw new Error("This lead is not assigned to you");
  }

  if (!lead.audio?.url) {
    throw new Error("Audio is required before claiming");
  }

  if (!lead.audioCompletedAt) {
    throw new Error(
      "You must complete the audio before claiming this lead"
    );
  }

  const previousStatus = lead.status;

  lead.status = LEAD_STATUS.CLAIMED;
  lead.claimedBy = new Types.ObjectId(salesUserId);
  lead.claimedAt = new Date();

  await lead.save();

  await createWorkflowLog({
    leadId: lead._id as Types.ObjectId,
    action: WORKFLOW_ACTIONS.CLAIM_LEAD,
    fromStatus: previousStatus,
    toStatus: LEAD_STATUS.CLAIMED,
    performedBy: new Types.ObjectId(salesUserId),
    performedByRole: "SALES",
  });

  return lead;
};
