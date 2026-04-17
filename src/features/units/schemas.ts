import { z } from "zod";

export const createUnitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  abbreviation: z.string().min(1, "Abbreviation is required"),
});

export const updateUnitSchema = createUnitSchema.extend({
  id: z.string().uuid("Invalid unit ID"),
});

export const toggleUnitActiveSchema = z.object({
  id: z.string().uuid("Invalid unit ID"),
  isActive: z.string().transform((v) => v === "true"),
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
