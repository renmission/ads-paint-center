// ============================================================
// ADS Paint Center – Database Schema
// NeonDB (PostgreSQL) + Drizzle ORM
// ============================================================

import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  numeric,
  timestamp,
  pgEnum,
  boolean,
  primaryKey,
} from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from 'next-auth/adapters';

// ────────────────────────────────────────────────────────────
// ENUMS
// ────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['admin', 'staff']);

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'confirmed',
  'processing',
  'ready',
  'delivered',
  'cancelled',
]);

export const orderTypeEnum = pgEnum('order_type', ['walk_in', 'online']);

export const paymentStatusEnum = pgEnum('payment_status', [
  'unpaid',
  'partial',
  'paid',
]);

export const paymentTypeEnum = pgEnum('payment_type', [
  'downpayment',
  'full',
  'balance',
  'other',
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'cash',
  'gcash',
  'bank_transfer',
  'other',
]);

export const smsStatusEnum = pgEnum('sms_status', ['pending', 'sent', 'failed']);

export const inventoryChangeTypeEnum = pgEnum('inventory_change_type', [
  'purchase',
  'sale',
  'adjustment',
  'return',
  'damage',
]);

// ────────────────────────────────────────────────────────────
// NEXTAUTH TABLES (Drizzle Adapter)
// ────────────────────────────────────────────────────────────

export const accounts = pgTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })],
);

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })],
);

// ────────────────────────────────────────────────────────────
// USERS
// ────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  passwordHash: text('password_hash'),
  role: userRoleEnum('role').notNull().default('staff'),
  isActive: boolean('is_active').notNull().default(true),
  image: text('image'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

// ────────────────────────────────────────────────────────────
// CUSTOMERS
// ────────────────────────────────────────────────────────────

export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  email: varchar('email', { length: 255 }),
  address: text('address'),
  notes: text('notes'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

// ────────────────────────────────────────────────────────────
// PRODUCTS / INVENTORY
// ────────────────────────────────────────────────────────────

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 100 }).unique(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  brand: varchar('brand', { length: 100 }),
  unit: varchar('unit', { length: 50 }).notNull().default('piece'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  lowStockThreshold: integer('low_stock_threshold').notNull().default(10),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

// ────────────────────────────────────────────────────────────
// ORDERS
// ────────────────────────────────────────────────────────────

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  customerId: integer('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  orderType: orderTypeEnum('order_type').notNull().default('walk_in'),
  status: orderStatusEnum('status').notNull().default('pending'),
  paymentStatus: paymentStatusEnum('payment_status').notNull().default('unpaid'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  amountPaid: numeric('amount_paid', { precision: 10, scale: 2 }).notNull().default('0'),
  notes: text('notes'),
  createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

// ────────────────────────────────────────────────────────────
// ORDER ITEMS
// ────────────────────────────────────────────────────────────

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
  productName: varchar('product_name', { length: 255 }).notNull(), // snapshot at time of sale
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
});

// ────────────────────────────────────────────────────────────
// PAYMENTS
// ────────────────────────────────────────────────────────────

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  paymentType: paymentTypeEnum('payment_type').notNull().default('full'),
  paymentMethod: paymentMethodEnum('payment_method').notNull().default('cash'),
  referenceNo: varchar('reference_no', { length: 100 }),
  notes: text('notes'),
  processedBy: text('processed_by').references(() => users.id, { onDelete: 'set null' }),
  paidAt: timestamp('paid_at', { mode: 'date' }).notNull().defaultNow(),
});

// ────────────────────────────────────────────────────────────
// INVENTORY LOGS
// ────────────────────────────────────────────────────────────

export const inventoryLogs = pgTable('inventory_logs', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
  productName: varchar('product_name', { length: 255 }).notNull(),
  changeType: inventoryChangeTypeEnum('change_type').notNull(),
  quantityChange: integer('quantity_change').notNull(), // positive = stock in, negative = stock out
  previousQty: integer('previous_qty').notNull(),
  newQty: integer('new_qty').notNull(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'set null' }),
  notes: text('notes'),
  createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

// ────────────────────────────────────────────────────────────
// SMS LOGS (iPROGSMS – student account, no sender name)
// ────────────────────────────────────────────────────────────

export const smsLogs = pgTable('sms_logs', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'set null' }),
  recipientPhone: varchar('recipient_phone', { length: 20 }).notNull(),
  message: text('message').notNull(),
  status: smsStatusEnum('status').notNull().default('pending'),
  providerRef: varchar('provider_ref', { length: 255 }),
  errorMessage: text('error_message'),
  sentAt: timestamp('sent_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

// ────────────────────────────────────────────────────────────
// TYPE EXPORTS (inferred from schema)
// ────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type InventoryLog = typeof inventoryLogs.$inferSelect;
export type SmsLog = typeof smsLogs.$inferSelect;
