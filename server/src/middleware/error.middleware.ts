import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import multer from "multer";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("[ErrorHandler]:", err);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Audio file must be less than 20 MB",
        errorCode: "FILE_TOO_LARGE",
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message,
      errorCode: "UPLOAD_ERROR",
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.code || err.errorCode,
    });
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err && typeof err === "object" && (err as { name?: string }).name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Resource not found with the specified ID format",
      errorCode: "INVALID_ID",
    });
  }

  // Handle Mongoose validation errors
  if (err && typeof err === "object" && (err as { name?: string }).name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: (err as Error).message,
      errorCode: "VALIDATION_ERROR",
    });
  }

  // Handle MongoDB duplicate key errors
  if (err && typeof err === "object" && (err as { code?: number }).code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A record with this unique field already exists",
      errorCode: "DUPLICATE_KEY",
    });
  }

  return res.status(500).json({
    success: false,
    message: err instanceof Error ? err.message : "Internal server error",
    errorCode: "INTERNAL_SERVER_ERROR",
  });
};
