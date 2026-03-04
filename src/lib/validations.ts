import { z } from 'zod';

// ─── Auth Schemas ─────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginForm = z.infer<typeof loginSchema>;

// ─── Customer Schemas ─────────────────────────────────────────

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateCustomerForm = z.infer<typeof createCustomerSchema>;

// ─── Product Schemas ──────────────────────────────────────────

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  sku: z.string().max(100).optional(),
  description: z.string().optional(),
  category: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  unit: z.string().min(1, 'Unit is required').max(50),
  price: z.coerce.number().positive('Price must be positive'),
  stockQuantity: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  lowStockThreshold: z.coerce.number().int().min(0).default(10),
});

export type CreateProductForm = z.infer<typeof createProductSchema>;

// ─── Order Schemas ────────────────────────────────────────────

export const createOrderSchema = z.object({
  customerId: z.coerce.number().int().positive().optional(),
  orderType: z.enum(['walk_in', 'online']).default('walk_in'),
  notes: z.string().optional(),
});

export type CreateOrderForm = z.infer<typeof createOrderSchema>;

// ─── Payment Schemas ──────────────────────────────────────────

export const createPaymentSchema = z.object({
  orderId: z.coerce.number().int().positive(),
  amount: z.coerce.number().positive('Amount must be positive'),
  paymentType: z.enum(['downpayment', 'full', 'balance', 'other']).default('full'),
  paymentMethod: z.enum(['cash', 'gcash', 'bank_transfer', 'other']).default('cash'),
  referenceNo: z.string().max(100).optional(),
  notes: z.string().optional(),
});

export type CreatePaymentForm = z.infer<typeof createPaymentSchema>;
