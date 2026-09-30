import { Types } from "mongoose";
import { Lead } from "../models/Lead.js";
import { LEAD_STATUS } from "../constants/leadStatus.js";
import { WORKFLOW_ACTIONS } from "../constants/workflowActions.js";
import { ROLES } from "../constants/roles.js";
import { canTransition } from "../utils/workflow.js";
import { createWorkflowLog } from "./workflow.service.js";
import {
  deleteAudioFromCloudinary,
  uploadAudioToCloudinary,
} from "./cloudinary.service.js";

interface UpdateVigilanceInput {
  name: string;
  postalAddress: string;
  date: Date;
  time: string;
  remark?: string;
}

export const updateVigilanceLead = async (
  leadId: string,
  input: UpdateVigilanceInput,
  _userId: string
) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new Error("Lead not found");
  }

  if (lead.status !== LEAD_STATUS.MEETING) {
    throw new Error(
      "Only MEETING leads can be processed by Vigilance"
    );
  }

  lead.name = input.name;
  lead.postalAddress = input.postalAddress;
  lead.date = input.date;
  lead.time = input.time;
  lead.remark = input.remark;

  await lead.save();

  return lead;
};

export const uploadLeadAudio = async (
  leadId: string,
  file: Express.Multer.File,
  userId: string
) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new Error("Lead not found");
  }

  if (lead.status !== LEAD_STATUS.MEETING) {
    throw new Error(
      "Audio can only be uploaded for MEETING leads"
    );
  }

  // Upload new audio first to avoid losing data if upload fails
  const uploaded = await uploadAudioToCloudinary(
    file.buffer,
    file.originalname
  );

  // Delete previous audio if present
  if (lead.audio?.publicId) {
    try {
      await deleteAudioFromCloudinary(
        lead.audio.publicId
      );
    } catch (error) {
      console.error(
        "Failed to delete previous audio:",
        error
      );
    }
  }

  lead.audio = {
    url: uploaded.secure_url,
    publicId: uploaded.public_id,
    fileName: file.originalname,
    mimeType: file.mimetype,
    duration: uploaded.duration ? Math.round(uploaded.duration) : undefined,
    uploadedAt: new Date(),
    uploadedBy: new Types.ObjectId(userId),
  };

  lead.audioCompletedAt = null;

  await lead.save();

  await createWorkflowLog({
    leadId: lead._id,
    action: WORKFLOW_ACTIONS.UPLOAD_AUDIO,
    fromStatus: lead.status,
    toStatus: lead.status,
    performedBy: new Types.ObjectId(userId),
    performedByRole: ROLES.VIGILANCE,
    metadata: {
      fileName: file.originalname,
      mimeType: file.mimetype,
      publicId: uploaded.public_id,
    },
  });

  return lead;
};

export const verifyLead = async (
  leadId: string,
  userId: string
) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new Error("Lead not found");
  }

  if (!canTransition(lead.status, LEAD_STATUS.VERIFIED)) {
    throw new Error(
      `Cannot verify lead from ${lead.status} state`
    );
  }

  if (!lead.audio?.url) {
    throw new Error(
      "Audio is mandatory before verification"
    );
  }

  const previousStatus = lead.status;

  lead.status = LEAD_STATUS.VERIFIED;

  await lead.save();

  await createWorkflowLog({
    leadId: lead._id,
    action: WORKFLOW_ACTIONS.VERIFY_LEAD,
    fromStatus: previousStatus,
    toStatus: LEAD_STATUS.VERIFIED,
    performedBy: new Types.ObjectId(userId),
    performedByRole: ROLES.VIGILANCE,
  });

  return lead;
};
