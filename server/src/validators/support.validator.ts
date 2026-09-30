import { z } from "zod";

export const allocateLeadSchema = z
  .object({
    assignedTo: z.string().min(1, "Sales user is required"),
  })
  .strict();
