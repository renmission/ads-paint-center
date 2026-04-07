import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  productName: z.string().min(1),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  unitPrice: z.number().nonnegative("Unit price must be non-negative"),
  lineTotal: z.number().nonnegative(),
});

export const completeSaleSchema = z.object({
  cartJson: z.string().transform((val, ctx) => {
    try {
      const parsed = JSON.parse(val);
      const result = z.array(cartItemSchema).min(1, "Cart must have at least one item").safeParse(parsed);
      if (!result.success) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.error.issues[0].message });
        return z.NEVER;
      }
      return result.data;
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid cart data" });
      return z.NEVER;
    }
  }),
  customerId: z.string().optional().or(z.literal("")),
  discountAmount: z
    .string()
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, {
      message: "Discount must be a non-negative number",
    }),
  paymentMethod: z.enum(["cash", "gcash", "credit", "other"]),
  amountTendered: z
    .string()
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, {
      message: "Amount tendered must be a non-negative number",
    }),
  notes: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
});

export const markCreditPaymentSchema = z.object({
  transactionId: z.string().uuid("Invalid transaction ID"),
  paymentAmount: z
    .string()
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Payment amount must be greater than 0",
    }),
  paymentMethod: z.enum(["cash", "gcash", "credit", "other"]),
});

export const addPaymentSchema = z.object({
  transactionId: z.string().uuid("Invalid transaction ID"),
  paymentAmount: z
    .string()
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Payment amount must be greater than 0",
    }),
  paymentMethod: z.enum(["cash", "gcash", "credit", "other"]),
  notes: z.string().optional().or(z.literal("")),
});

export const voidSaleSchema = z.object({
  transactionId: z.string().uuid("Invalid transaction ID"),
});

export type AddPaymentInput = z.infer<typeof addPaymentSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type CompleteSaleInput = z.infer<typeof completeSaleSchema>;
export type MarkCreditPaymentInput = z.infer<typeof markCreditPaymentSchema>;
export type VoidSaleInput = z.infer<typeof voidSaleSchema>;
