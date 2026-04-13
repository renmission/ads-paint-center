import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  lineTotal: z.number().positive(),
});

export type CartItem = z.infer<typeof cartItemSchema>;

export const placeOrderSchema = z
  .object({
    customerName: z.string().min(1, "Name is required"),
    customerPhone: z.string().min(7, "Valid phone number is required"),
    customerEmail: z.string().email().optional().or(z.literal("")),
    deliveryType: z.enum(["pickup", "delivery"]),
    deliveryAddress: z.string().optional(),
    paymentMethod: z.enum(["cash", "gcash", "other"]),
    notes: z.string().optional(),
    cartJson: z.string().min(1, "Cart is empty"),
  })
  .refine(
    (d) =>
      d.deliveryType !== "delivery" ||
      (d.deliveryAddress && d.deliveryAddress.trim().length > 0),
    {
      message: "Delivery address is required for delivery orders",
      path: ["deliveryAddress"],
    },
  );

export const handleOrderSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["confirm", "fulfil", "cancel", "mark_paid"]),
  notes: z.string().optional(),
});
