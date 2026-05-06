import { z } from "zod";

export const serviceJobItemSchema = z.object({
  productId: z.string().uuid().optional().or(z.literal("")),
  description: z.string().min(1, "Description is required").max(255),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Price must be non-negative"),
});

export const createServiceJobSchema = z.object({
  customerId: z.string().uuid("Customer is required"),
  serviceId: z.string().uuid().optional().or(z.literal("")),
  scheduledAt: z.string().optional().or(z.literal("")),
  address: z.string().min(1, "Job site address is required").max(500),
  notes: z.string().max(1000).optional().or(z.literal("")),
  handledBy: z.string().uuid().optional().or(z.literal("")),
  items: z.array(serviceJobItemSchema),
});

export const updateServiceJobStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "scheduled", "in_progress", "completed", "cancelled"]),
});

export type CreateServiceJobInput = z.infer<typeof createServiceJobSchema>;
export type ServiceJobItemInput = z.infer<typeof serviceJobItemSchema>;
export type UpdateServiceJobStatusInput = z.infer<typeof updateServiceJobStatusSchema>;
