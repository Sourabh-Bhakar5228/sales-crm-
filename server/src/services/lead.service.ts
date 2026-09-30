import mongoose, { FilterQuery } from "mongoose";
import { Lead, ILead, IAudio } from "../models/Lead.js";
import { User } from "../models/User.js";
import { createWorkflowLog } from "./workflow.service.js";
import { LEAD_STATUS } from "../constants/leadStatus.js";
import { WORKFLOW_ACTIONS } from "../constants/workflowActions.js";
import { ROLES, Role } from "../constants/roles.js";
import { CreateLeadInput } from "../validators/lead.validator.js";
import { AppError } from "../utils/AppError.js";

// 6.7 Create Lead Service
export const createLead = async (
  input: CreateLeadInput,
  userId: string,
  userRole: Role
) => {
  const lead = await Lead.create({
    name: input.name,
    contactNumber: input.contactNumber,
    status: LEAD_STATUS.CREATED,
    createdBy: new mongoose.Types.ObjectId(userId),
  });

  await createWorkflowLog({
    leadId: lead._id,
    action: WORKFLOW_ACTIONS.CREATE_LEAD,
    fromStatus: null,
    toStatus: LEAD_STATUS.CREATED,
    performedBy: new mongoose.Types.ObjectId(userId),
    performedByRole: userRole,
    metadata: {
      initialName: lead.name,
      contact: lead.contactNumber,
    },
  });

  return lead;
};

// 6.14 GET /leads Service by Role Isolation
export const getLeadsForUser = async (
  userId: string,
  role: Role,
  queryStatus?: string
) => {
  const filter: FilterQuery<ILead> = {};

  switch (role) {
    case ROLES.MARKETING:
      // Marketing sees CREATED leads created by them
      filter.status = queryStatus || LEAD_STATUS.CREATED;
      filter.createdBy = new mongoose.Types.ObjectId(userId);
      break;

    case ROLES.COMMUNICATION:
      // Communication sees all CREATED leads to schedule meetings
      filter.status = queryStatus || LEAD_STATUS.CREATED;
      break;

    case ROLES.VIGILANCE:
      // Vigilance sees MEETING leads to upload audio and verify
      filter.status = queryStatus || LEAD_STATUS.MEETING;
      break;

    case ROLES.SUPPORT:
      // Support sees VERIFIED leads to allocate
      filter.status = queryStatus || LEAD_STATUS.VERIFIED;
      break;

    case ROLES.SALES:
      // Sales sees ALLOCATED leads assigned to them, or CLAIMED by them
      if (queryStatus === LEAD_STATUS.CLAIMED) {
        filter.status = LEAD_STATUS.CLAIMED;
        filter.claimedBy = new mongoose.Types.ObjectId(userId);
      } else {
        filter.status = LEAD_STATUS.ALLOCATED;
        filter.assignedTo = new mongoose.Types.ObjectId(userId);
      }
      break;

    default:
      filter.status = LEAD_STATUS.CREATED;
  }

  return Lead.find(filter)
    .populate("createdBy", "name email role")
    .populate("assignedTo", "name email role")
    .populate("claimedBy", "name email role")
    .sort({ createdAt: -1 });
};

// Single Lead Query with RBAC Access Control
export const getLeadById = async (
  leadId: string,
  userId: string,
  userRole: Role
) => {
  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    throw new AppError("Invalid lead ID format", 400, "INVALID_ID");
  }

  const lead = await Lead.findById(leadId)
    .populate("createdBy", "name email role")
    .populate("assignedTo", "name email role")
    .populate("claimedBy", "name email role")
    .populate("audio.uploadedBy", "name email role");

  if (!lead) {
    throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
  }

  // Access control per role
  const createdById =
    (lead.createdBy as any)?._id?.toString() || lead.createdBy?.toString();
  const assignedToId =
    (lead.assignedTo as any)?._id?.toString() || lead.assignedTo?.toString();

  switch (userRole) {
    case ROLES.MARKETING:
      if (createdById !== userId) {
        throw new Error("You do not have access to this lead");
      }
      break;

    case ROLES.SALES:
      if (assignedToId !== userId) {
        throw new Error("You do not have access to this lead");
      }
      break;

    case ROLES.COMMUNICATION:
      if (
        ![
          LEAD_STATUS.CREATED,
          LEAD_STATUS.MEETING,
        ].includes(lead.status as any)
      ) {
        throw new Error("You do not have access to this lead");
      }
      break;

    case ROLES.VIGILANCE:
      if (lead.status !== LEAD_STATUS.MEETING) {
        throw new Error("You do not have access to this lead");
      }
      break;

    case ROLES.SUPPORT:
      if (lead.status !== LEAD_STATUS.VERIFIED) {
        throw new Error("You do not have access to this lead");
      }
      break;

    default:
      throw new Error("Invalid role");
  }

  return lead;
};

import { canTransition } from "../utils/workflow.js";
import { MeetingInput } from "../validators/lead.validator.js";

// 7.5 Communication: Mark Lead As Meeting
export const markLeadAsMeeting = async (
  leadId: string,
  input: MeetingInput,
  userId: string,
  userRole: Role
) => {
  if (userRole !== ROLES.COMMUNICATION) {
    throw new Error("Only Communication can mark a meeting");
  }

  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
  }

  if (!canTransition(lead.status, LEAD_STATUS.MEETING)) {
    throw new AppError(
      `Lead cannot move from ${lead.status} to MEETING`,
      409,
      "INVALID_WORKFLOW"
    );
  }

  lead.name = input.name;
  lead.postalAddress = input.postalAddress;
  lead.date = input.date;
  lead.time = input.time;
  lead.remark = input.remark;

  const previousStatus = lead.status;
  lead.status = LEAD_STATUS.MEETING;

  await lead.save();

  await createWorkflowLog({
    leadId: lead._id,
    action: WORKFLOW_ACTIONS.MARK_MEETING,
    fromStatus: previousStatus,
    toStatus: LEAD_STATUS.MEETING,
    performedBy: new mongoose.Types.ObjectId(userId),
    performedByRole: userRole,
    metadata: {
      address: lead.postalAddress,
      date: lead.date,
      time: lead.time,
      remark: lead.remark,
    },
  });

  return lead;
};

export const markMeeting = markLeadAsMeeting;

// Vigilance: Attach Audio
export const attachAudio = async (leadId: string, audioData: IAudio, userId: string, userRole: Role) => {
  const lead = await Lead.findById(leadId);
  if (!lead) {
    throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
  }

  if (lead.status !== LEAD_STATUS.MEETING) {
    throw new AppError(`Audio can only be uploaded in MEETING status. Current: ${lead.status}`, 409, "INVALID_WORKFLOW");
  }

  lead.audio = audioData;
  await lead.save();

  await createWorkflowLog({
    leadId: lead._id,
    action: WORKFLOW_ACTIONS.UPLOAD_AUDIO,
    fromStatus: lead.status,
    toStatus: lead.status,
    performedBy: new mongoose.Types.ObjectId(userId),
    performedByRole: userRole,
    metadata: { fileName: audioData.fileName, url: audioData.url },
  });

  return lead;
};

// Vigilance: Verify Lead
export const verifyLead = async (
  leadId: string,
  data: { name?: string; postalAddress?: string; date?: string | Date; time?: string; remark?: string },
  userId: string,
  userRole: Role
) => {
  const lead = await Lead.findById(leadId);
  if (!lead) {
    throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
  }

  if (lead.status !== LEAD_STATUS.MEETING) {
    throw new AppError(`Lead cannot be verified from status: ${lead.status}`, 409, "INVALID_WORKFLOW");
  }

  if (!lead.audio || !lead.audio.url) {
    throw new AppError("Audio is required before verification", 400, "AUDIO_REQUIRED");
  }

  if (data.name) lead.name = data.name.trim();
  if (data.postalAddress) lead.postalAddress = data.postalAddress.trim();
  if (data.date) lead.date = new Date(data.date);
  if (data.time) lead.time = data.time.trim();
  if (data.remark) lead.remark = data.remark.trim();

  lead.status = LEAD_STATUS.VERIFIED;
  await lead.save();

  await createWorkflowLog({
    leadId: lead._id,
    action: WORKFLOW_ACTIONS.VERIFY_LEAD,
    fromStatus: LEAD_STATUS.MEETING,
    toStatus: LEAD_STATUS.VERIFIED,
    performedBy: new mongoose.Types.ObjectId(userId),
    performedByRole: userRole,
    metadata: { remark: lead.remark },
  });

  return lead;
};

// Support: Allocate Lead
export const allocateLead = async (leadId: string, salesUserId: string, userId: string, userRole: Role) => {
  if (!salesUserId || !mongoose.Types.ObjectId.isValid(salesUserId)) {
    throw new AppError("Valid Sales user ID is required", 400, "VALIDATION_ERROR");
  }

  const salesUser = await User.findById(salesUserId);
  if (!salesUser || salesUser.role !== ROLES.SALES || !salesUser.isActive) {
    throw new AppError("Target user must be an active Sales representative", 400, "INVALID_SALES_USER");
  }

  const lead = await Lead.findById(leadId);
  if (!lead) {
    throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
  }

  if (lead.status !== LEAD_STATUS.VERIFIED) {
    throw new AppError(`Lead cannot be allocated from status: ${lead.status}`, 409, "INVALID_WORKFLOW");
  }

  lead.assignedTo = new mongoose.Types.ObjectId(salesUserId);
  lead.status = LEAD_STATUS.ALLOCATED;
  await lead.save();

  await createWorkflowLog({
    leadId: lead._id,
    action: WORKFLOW_ACTIONS.ALLOCATE_LEAD,
    fromStatus: LEAD_STATUS.VERIFIED,
    toStatus: LEAD_STATUS.ALLOCATED,
    performedBy: new mongoose.Types.ObjectId(userId),
    performedByRole: userRole,
    metadata: { salesUserId, salesUserName: salesUser.name },
  });

  return lead;
};

// Sales: Record Audio Completed Proof
export const recordAudioCompleted = async (leadId: string, userId: string, userRole: Role) => {
  const lead = await Lead.findById(leadId);
  if (!lead) {
    throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
  }

  if (lead.status !== LEAD_STATUS.ALLOCATED) {
    throw new AppError(`Audio completion can only be recorded for ALLOCATED leads`, 409, "INVALID_WORKFLOW");
  }

  if (lead.assignedTo && lead.assignedTo.toString() !== userId) {
    throw new AppError("This lead is not allocated to you", 403, "FORBIDDEN");
  }

  if (!lead.audio || !lead.audio.url) {
    throw new AppError("Customer call audio recording is missing", 400, "AUDIO_REQUIRED");
  }

  lead.audioCompletedAt = new Date();
  lead.audioCompletedBy = new mongoose.Types.ObjectId(userId);
  await lead.save();

  await createWorkflowLog({
    leadId: lead._id,
    action: WORKFLOW_ACTIONS.AUDIO_COMPLETED,
    fromStatus: lead.status,
    toStatus: lead.status,
    performedBy: new mongoose.Types.ObjectId(userId),
    performedByRole: userRole,
    metadata: { audioCompletedAt: lead.audioCompletedAt },
  });

  return lead;
};

// Sales: Claim Lead
export const claimLead = async (leadId: string, userId: string, userRole: Role) => {
  const lead = await Lead.findById(leadId);
  if (!lead) {
    throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");
  }

  if (lead.status !== LEAD_STATUS.ALLOCATED) {
    throw new AppError(`Lead cannot be claimed from status: ${lead.status}`, 409, "INVALID_WORKFLOW");
  }

  if (lead.assignedTo && lead.assignedTo.toString() !== userId) {
    throw new AppError("This lead is allocated to a different Sales representative", 403, "FORBIDDEN");
  }

  if (!lead.audio || !lead.audio.url) {
    throw new AppError("Customer call audio recording is missing", 400, "AUDIO_REQUIRED");
  }

  if (!lead.audioCompletedAt) {
    throw new AppError("Please complete the audio before claiming the lead", 400, "AUDIO_NOT_COMPLETED");
  }

  const updatedLead = await Lead.findOneAndUpdate(
    { _id: lead._id, status: LEAD_STATUS.ALLOCATED, audioCompletedAt: { $ne: null } },
    { status: LEAD_STATUS.CLAIMED, claimedBy: new mongoose.Types.ObjectId(userId), claimedAt: new Date() },
    { new: true }
  );

  if (!updatedLead) {
    throw new AppError("Lead was already claimed or state changed", 409, "RACE_CONDITION_DETECTED");
  }

  await createWorkflowLog({
    leadId: updatedLead._id,
    action: WORKFLOW_ACTIONS.CLAIM_LEAD,
    fromStatus: LEAD_STATUS.ALLOCATED,
    toStatus: LEAD_STATUS.CLAIMED,
    performedBy: new mongoose.Types.ObjectId(userId),
    performedByRole: userRole,
    metadata: { claimedAt: updatedLead.claimedAt },
  });

  return updatedLead;
};

export const getLeadStats = async (userId: string, userRole: Role) => {
  const [createdCount, meetingCount, verifiedCount, allocatedCount, claimedCount] = await Promise.all([
    Lead.countDocuments({ status: LEAD_STATUS.CREATED }),
    Lead.countDocuments({ status: LEAD_STATUS.MEETING }),
    Lead.countDocuments({ status: LEAD_STATUS.VERIFIED }),
    Lead.countDocuments({ status: LEAD_STATUS.ALLOCATED }),
    Lead.countDocuments({ status: LEAD_STATUS.CLAIMED }),
  ]);

  let total = 0;
  let pending = 0;
  let completed = 0;

  switch (userRole) {
    case ROLES.MARKETING:
      total = await Lead.countDocuments({ createdBy: new mongoose.Types.ObjectId(userId) });
      pending = await Lead.countDocuments({ createdBy: new mongoose.Types.ObjectId(userId), status: LEAD_STATUS.CREATED });
      completed = total - pending;
      break;
    case ROLES.COMMUNICATION:
      total = createdCount + meetingCount;
      pending = createdCount;
      completed = meetingCount;
      break;
    case ROLES.VIGILANCE:
      total = meetingCount + verifiedCount;
      pending = meetingCount;
      completed = verifiedCount;
      break;
    case ROLES.SUPPORT:
      total = verifiedCount + allocatedCount;
      pending = verifiedCount;
      completed = allocatedCount;
      break;
    case ROLES.SALES:
      total = await Lead.countDocuments({ assignedTo: new mongoose.Types.ObjectId(userId) });
      pending = await Lead.countDocuments({ assignedTo: new mongoose.Types.ObjectId(userId), status: LEAD_STATUS.ALLOCATED });
      completed = await Lead.countDocuments({ claimedBy: new mongoose.Types.ObjectId(userId), status: LEAD_STATUS.CLAIMED });
      break;
    default:
      total = createdCount + meetingCount + verifiedCount + allocatedCount + claimedCount;
      pending = createdCount + meetingCount + verifiedCount + allocatedCount;
      completed = claimedCount;
      break;
  }

  return {
    total,
    pending,
    completed,
    byStatus: {
      CREATED: createdCount,
      MEETING: meetingCount,
      VERIFIED: verifiedCount,
      ALLOCATED: allocatedCount,
      CLAIMED: claimedCount,
    },
  };
};

export class LeadService {
  static createLead = createLead;
  static getLeads = (user: { id: string; role: Role }, queryStatus?: string) =>
    getLeadsForUser(user.id, user.role, queryStatus);
  static getLeadById = (leadId: string, user?: { id: string; role: Role }) =>
    user ? getLeadById(leadId, user.id, user.role) : (Lead.findById(leadId) as any);
  static getLeadStats = getLeadStats;
  static markMeeting = (leadId: string, data: any, user: { id: string; role: Role }) =>
    markMeeting(leadId, data, user.id, user.role);
  static attachAudio = (leadId: string, audioData: IAudio, user: { id: string; role: Role }) =>
    attachAudio(leadId, audioData, user.id, user.role);
  static verifyLead = (leadId: string, data: any, user: { id: string; role: Role }) =>
    verifyLead(leadId, data, user.id, user.role);
  static allocateLead = (leadId: string, salesUserId: string, user: { id: string; role: Role }) =>
    allocateLead(leadId, salesUserId, user.id, user.role);
  static recordAudioCompleted = (leadId: string, user: { id: string; role: Role }) =>
    recordAudioCompleted(leadId, user.id, user.role);
  static claimLead = (leadId: string, user: { id: string; role: Role }) =>
    claimLead(leadId, user.id, user.role);
}
