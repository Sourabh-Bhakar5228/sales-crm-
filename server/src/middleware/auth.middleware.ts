import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/User.js";
import { Role } from "../constants/roles.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
    name?: string;
    email?: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.cookies?.accessToken;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: "User is not authorized",
      });
      return;
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
