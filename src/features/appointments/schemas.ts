import { z } from "zod";

export const createAppointmentSchema = z.object({
  customerId: z.string().uuid("Customer is required"),
  serviceId: z.string().optional().or(z.literal("")),
  staffId: z.string().optional().or(z.literal("")),
  scheduledAt: z.string().min(1, "Scheduled date/time is required"),
  notes: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

export const updateAppointmentSchema = z.object({
  id: z.string().uuid("Invalid appointment ID"),
  action: z.enum(["confirm", "start", "complete", "cancel", "reassign"]),
  staffId: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;

export const requestAppointmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(7, "Valid phone number is required"),
  serviceId: z.string().optional().or(z.literal("")),
  scheduledAt: z.string().min(1, "Preferred date & time is required"),
  address: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type RequestAppointmentInput = z.infer<typeof requestAppointmentSchema>;
