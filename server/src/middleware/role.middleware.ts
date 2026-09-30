import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth.middleware.js";
import { Role } from "../constants/roles.js";

export const authorize =
  (...allowedRoles: Role[]) =>
  (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission",
        errorCode: "FORBIDDEN",
      });
      return;
    }

    next();
  };
