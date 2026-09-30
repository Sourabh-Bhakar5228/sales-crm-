import { z } from 'zod';

export const createLeadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  contactNumber: z.string().min(7, 'Invalid contact number').max(15)
});

export const scheduleMeetingSchema = z.object({
  postalAddress: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  remark: z.string().optional()
});

export const verifyLeadSchema = z.object({
  name: z.string().optional(),
  postalAddress: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  remark: z.string().optional()
});

export const allocateLeadSchema = z.object({
  salesUserId: z.string().min(1, 'Sales user ID is required')
});
