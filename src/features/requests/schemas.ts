import { z } from "zod";

export const createRequestSchema = z
  .object({
    customerId: z.string().uuid("Customer is required"),
    productId: z.string().optional().or(z.literal("")),
    productDescription: z.string().optional().or(z.literal("")),
    quantityRequested: z
      .string()
      .refine((v) => !isNaN(parseInt(v)) && parseInt(v) >= 1, {
        message: "Quantity must be at least 1",
      }),
    deliveryType: z.enum(["pickup", "delivery"]).optional(),
    deliveryAddress: z.string().optional().or(z.literal("")),
    deliveryDate: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) =>
      (data.productId && data.productId !== "") ||
      (data.productDescription && data.productDescription.trim() !== ""),
    { message: "Either select a product or provide a product description" }
  )
  .refine(
    (data) =>
      data.deliveryType !== "delivery" ||
      (data.deliveryAddress && data.deliveryAddress.trim() !== ""),
    { message: "Delivery address is required for delivery orders" }
  );

export const handleRequestSchema = z
  .object({
    id: z.string().uuid("Invalid request ID"),
    action: z.enum(["approve", "reject", "fulfill", "mark_out_for_delivery"]),
    rejectionReason: z.string().optional().or(z.literal("")),
    driverId: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) =>
      data.action !== "reject" ||
      (data.rejectionReason && data.rejectionReason.trim() !== ""),
    { message: "Rejection reason is required when rejecting a request" }
  );

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type HandleRequestInput = z.infer<typeof handleRequestSchema>;
