import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { createLeadSchema, meetingSchema } from "../validators/lead.validator.js";
import {
  createLead as createLeadService,
  getLeadsForUser,
  getLeadById as getLeadByIdService,
  markMeeting as markMeetingService,
  markLeadAsMeeting,
  attachAudio as attachAudioService,
  verifyLead as verifyLeadService,
  allocateLead as allocateLeadService,
  recordAudioCompleted as recordAudioCompletedService,
  claimLead as claimLeadService,
  getLeadStats,
} from "../services/lead.service.js";
import { AudioService } from "../services/audio.service.js";
import { getWorkflowLogsForLead } from "../services/workflow.service.js";
import { AppError } from "../utils/AppError.js";
import { User } from "../models/User.js";
import { ROLES, Role } from "../constants/roles.js";

// 6.8 Create Lead Controller
export const createLead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const input = createLeadSchema.parse(req.body);

    const lead = await createLeadService(
      input,
      req.user.id,
      req.user.role
    );

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to create lead",
    });
  }
};

// 6.15 GET Leads Controller (Role-Filtered)
export const getLeads = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const statusQuery = req.query.status as string | undefined;

    const leads = await getLeadsForUser(
      req.user.id,
      req.user.role,
      statusQuery
    );

    res.status(200).json({
      success: true,
      data: leads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch leads",
    });
  }
};

// GET Single Lead Detail with RBAC
export const getLeadById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const leadId = req.params.id as string;
    const lead = await getLeadByIdService(leadId, req.user.id, req.user.role as Role);
    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error: any) {
    res.status(403).json({
      success: false,
      message: error instanceof Error ? error.message : "Unable to fetch lead",
    });
  }
};

// 7.7 Communication: Mark Meeting
export const markMeeting = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const id = req.params.id as string;
    const input = meetingSchema.parse(req.body);

    const lead = await markLeadAsMeeting(
      id,
      input,
      req.user.id,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: "Meeting marked successfully",
      data: lead,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to mark meeting",
    });
  }
};

// Vigilance: Upload Audio
export const uploadAudio = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }
    const leadId = req.params.id as string;
    if (!req.file) {
      throw new AppError("Audio file is required", 400, "FILE_MISSING");
    }

    const audioDetails = await AudioService.uploadAudio(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      req.user.id
    );

    const lead = await attachAudioService(leadId, audioDetails as any, req.user.id, req.user.role);

    res.status(200).json({
      success: true,
      message: "Audio uploaded successfully",
      data: {
        audio: lead.audio,
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
      errorCode: error.errorCode,
    });
  }
};

// Vigilance: Verify Lead
export const verifyLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }
    const leadId = req.params.id as string;
    const { name, postalAddress, date, time, remark } = req.body;

    const lead = await verifyLeadService(
      leadId,
      { name, postalAddress, date, time, remark },
      req.user.id,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: "Lead verified successfully",
      data: {
        id: lead._id,
        status: lead.status,
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
      errorCode: error.errorCode,
    });
  }
};

// Support: Allocate Lead
export const allocateLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }
    const leadId = req.params.id as string;
    const { salesUserId } = req.body;

    const lead = await allocateLeadService(leadId, salesUserId, req.user.id, req.user.role);

    res.status(200).json({
      success: true,
      message: "Lead allocated successfully",
      data: {
        id: lead._id,
        status: lead.status,
        assignedTo: lead.assignedTo,
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
      errorCode: error.errorCode,
    });
  }
};

// Sales: Record Audio Completed
export const audioCompleted = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }
    const leadId = req.params.id as string;
    await recordAudioCompletedService(leadId, req.user.id, req.user.role);

    res.status(200).json({
      success: true,
      message: "Audio completion recorded",
    });
  } catch (error: any) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
      errorCode: error.errorCode,
    });
  }
};

// Sales: Claim Lead
export const claimLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }
    const leadId = req.params.id as string;
    const lead = await claimLeadService(leadId, req.user.id, req.user.role);

    res.status(200).json({
      success: true,
      message: "Lead claimed successfully",
      data: {
        id: lead._id,
        status: lead.status,
        claimedBy: lead.claimedBy,
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
      errorCode: error.errorCode,
    });
  }
};

// Workflow Logs
export const getWorkflow = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const leadId = req.params.id as string;
    const logs = await getWorkflowLogsForLead(leadId);
    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve workflow logs",
    });
  }
};

// Support helper: Sales Users
export const getSalesUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const salesUsers = await User.find({ role: ROLES.SALES, isActive: true })
      .select("name email role")
      .lean();

    res.status(200).json({
      success: true,
      data: salesUsers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve sales users",
    });
  }
};

// Dashboard Stats
export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const stats = await getLeadStats(req.user.id, req.user.role);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve lead statistics",
    });
  }
};

export class LeadController {
  static create = createLead;
  static getLeads = getLeads;
  static getLeadById = getLeadById;
  static getStats = getStats;
  static markMeeting = markMeeting;
  static uploadAudio = uploadAudio;
  static verifyLead = verifyLead;
  static allocateLead = allocateLead;
  static audioCompleted = audioCompleted;
  static claimLead = claimLead;
  static getWorkflow = getWorkflow;
  static getSalesUsers = getSalesUsers;
}
