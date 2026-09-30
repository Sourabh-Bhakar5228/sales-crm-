import { Request, Response } from "express";
import { getSalesUsers } from "../services/user.service.js";

export const getSalesUsersController = async (
  _req: Request,
  res: Response
) => {
  try {
    const users = await getSalesUsers();

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch Sales users",
    });
  }
};
