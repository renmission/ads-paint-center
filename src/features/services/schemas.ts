import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional().or(z.literal("")),
  price: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, {
    message: "Price must be a non-negative number",
  }),
  duration: z.string().refine((v) => !isNaN(parseInt(v)) && parseInt(v) > 0, {
    message: "Duration must be at least 1 minute",
  }),
  category: z.string().min(1, "Category is required"),
});

export const editServiceSchema = createServiceSchema.extend({
  id: z.string().uuid("Invalid service ID"),
});

export const toggleServiceSchema = z.object({
  id: z.string().uuid("Invalid service ID"),
  isActive: z.enum(["true", "false"]),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type EditServiceInput = z.infer<typeof editServiceSchema>;
