import { z } from "zod";

export const createLeadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(100),

  contactNumber: z
    .string()
    .trim()
    .regex(
      /^[0-9]{10}$/,
      "Contact number must contain 10 digits"
    ),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const meetingSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters")
      .max(100),

    postalAddress: z
      .string()
      .trim()
      .min(3, "Postal address is required")
      .max(500),

    date: z.coerce.date({
      message: "Valid date is required",
    }),

    time: z
      .string()
      .trim()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Time must be in HH:mm format"
      ),

    remark: z
      .string()
      .trim()
      .max(1000)
      .optional(),
  })
  .strict();

export type MeetingInput = z.infer<typeof meetingSchema>;
