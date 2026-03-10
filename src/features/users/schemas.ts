import { z } from "zod";

export const createStaffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["administrator", "staff"]),
  phone: z.string().optional(),
});

export const updateStaffSchema = z.object({
  id: z.string().uuid("Invalid staff ID"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  role: z.enum(["administrator", "staff"]),
});

export const changePasswordSchema = z.object({
  id: z.string().uuid("Invalid staff ID"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
