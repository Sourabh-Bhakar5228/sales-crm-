import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { allocateLeadSchema } from "../validators/support.validator.js";
import { allocateLead } from "../services/support.service.js";

export const allocate = async (
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

    const parsed = allocateLeadSchema.parse(req.body);

    const lead = await allocateLead(
      req.params.id as string,
      parsed.assignedTo,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Lead allocated successfully",
      data: lead,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to allocate lead",
    });
  }
};
