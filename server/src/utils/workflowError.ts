import { AppError } from "./AppError.js";

export const invalidWorkflow = (
  from: string,
  to: string
) => {
  return new AppError(
    `Invalid workflow transition: ${from} → ${to}`,
    409,
    "INVALID_WORKFLOW"
  );
};
