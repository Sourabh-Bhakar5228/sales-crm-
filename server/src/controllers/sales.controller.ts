import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import {
  markAudioCompleted,
  claimLead,
} from "../services/sales.service.js";

export const audioCompleted = async (
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

    const lead = await markAudioCompleted(
      req.params.id as string,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Audio completion recorded",
      data: lead,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to record audio completion",
    });
  }
};

export const claim = async (
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

    const lead = await claimLead(
      req.params.id as string,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Lead claimed successfully",
      data: lead,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to claim lead",
    });
  }
};
