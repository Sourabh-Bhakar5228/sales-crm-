import { Request, Response } from "express";
import { loginSchema } from "../validators/auth.validator.js";
import { loginUser, getMeUser } from "../services/auth.service.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const result = await loginUser(validatedData);

    res
      .cookie("accessToken", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        data: {
          user: result.user,
          token: result.token, // Also available in data for flexible Postman/API client use
        },
      });
  } catch (error) {
    res.status(401).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Login failed",
    });
  }
};

export const logout = (
  _req: Request,
  res: Response
): void => {
  res
    .clearCookie("accessToken")
    .status(200)
    .json({
      success: true,
      message: "Logged out successfully",
    });
};

export const getMe = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }
    const user = await getMeUser(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : "Unauthorized",
    });
  }
};

export class AuthController {
  static login = login;
  static logout = logout;
  static getMe = getMe;
}
