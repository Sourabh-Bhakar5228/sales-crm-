export class AppError extends Error {
  statusCode: number;
  code?: string;
  errorCode: string;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    code?: string
  ) {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code || "APP_ERROR";
    this.errorCode = code || "APP_ERROR";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
