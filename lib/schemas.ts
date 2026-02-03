import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createApplicationSchema = z.object({
  company: z.string().min(1, "Company is required"),
  roleTitle: z.string().min(1, "Role title is required"),
  location: z.string().optional(),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  salaryRange: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["SAVED", "APPLIED", "OA", "PHONE", "ONSITE", "OFFER", "REJECTED", "GHOSTED"]).optional(),
});

export const updateApplicationSchema = z.object({
  company: z.string().min(1).optional(),
  roleTitle: z.string().min(1).optional(),
  location: z.string().optional(),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  salaryRange: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["SAVED", "APPLIED", "OA", "PHONE", "ONSITE", "OFFER", "REJECTED", "GHOSTED"]).optional(),
  appliedAt: z.string().datetime().optional(), // optional if you add date UI later
});
