import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { meetingSchema } from "../validators/lead.validator.js";
import {
  updateVigilanceLead,
  uploadLeadAudio,
  verifyLead,
} from "../services/vigilance.service.js";

export const updateVigilance = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const parsed = meetingSchema.parse(req.body);

    const lead = await updateVigilanceLead(
      req.params.id as string,
      parsed,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: lead,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update lead",
    });
  }
};

export const uploadAudio = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Audio file is required",
      });
    }

    const lead = await uploadLeadAudio(
      req.params.id as string,
      req.file,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Audio uploaded successfully",
      data: lead,
    });
  } catch (error) {
    console.error("Vigilance upload error:", error);
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Audio upload failed",
    });
  }
};

export const verify = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const lead = await verifyLead(
      req.params.id as string,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Lead verified successfully",
      data: lead,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Verification failed",
    });
  }
};
