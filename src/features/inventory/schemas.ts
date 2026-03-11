import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  sku: z.string().optional().or(z.literal("")),
  description: z.string().optional(),
  category: z.enum([
    "paint",
    "coating",
    "primer",
    "varnish",
    "thinner",
    "tool",
    "supply",
    "other",
  ]),
  unit: z.string().min(1, "Unit is required"),
  price: z
    .string()
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, {
      message: "Price must be a non-negative number",
    }),
  lowStockThreshold: z
    .string()
    .optional()
    .refine((v) => v === undefined || v === "" || (!isNaN(parseInt(v)) && parseInt(v) >= 0), {
      message: "Threshold must be a non-negative integer",
    }),
});

export const updateProductSchema = createProductSchema.extend({
  id: z.string().uuid("Invalid product ID"),
});

export const adjustStockSchema = z.object({
  inventoryId: z.string().uuid("Invalid inventory ID"),
  productId: z.string().uuid("Invalid product ID"),
  quantityOnHand: z
    .string()
    .refine((v) => !isNaN(parseInt(v)) && parseInt(v) >= 0, {
      message: "Quantity must be a non-negative integer",
    }),
  lowStockThreshold: z
    .string()
    .refine((v) => !isNaN(parseInt(v)) && parseInt(v) >= 0, {
      message: "Threshold must be a non-negative integer",
    }),
});

export const toggleProductActiveSchema = z.object({
  id: z.string().uuid("Invalid product ID"),
  isActive: z.string().transform((v) => v === "true"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
