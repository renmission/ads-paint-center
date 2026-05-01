import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["administrator", "staff", "customer"]);

export const productCategoryEnum = pgEnum("product_category", [
  "paint",
  "coating",
  "primer",
  "varnish",
  "thinner",
  "tool",
  "supply",
  "other",
]);

export const requestStatusEnum = pgEnum("request_status", [
  "pending",
  "approved",
  "out_for_delivery",
  "rejected",
  "fulfilled",
]);

export const deliveryTypeEnum = pgEnum("delivery_type", ["pickup", "delivery"]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "completed",
  "voided",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "gcash",
  "credit",
  "other",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "fulfilled",
  "cancelled",
]);

export const orderPaymentStatusEnum = pgEnum("order_payment_status", [
  "unpaid",
  "paid",
]);

// ─── Units ────────────────────────────────────────────────────────────────────

export const units = pgTable("units", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  abbreviation: varchar("abbreviation", { length: 20 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Users / Staff ────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("staff"),
  phone: varchar("phone", { length: 20 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Customers ────────────────────────────────────────────────────────────────

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Products ─────────────────────────────────────────────────────────────────

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }).unique(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 500 }),
  category: productCategoryEnum("category").notNull().default("other"),
  unit: varchar("unit", { length: 50 }).notNull().default("piece"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Inventory ────────────────────────────────────────────────────────────────

export const inventory = pgTable("inventory", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" })
    .unique(),
  quantityOnHand: integer("quantity_on_hand").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(10),
  lastRestockedAt: timestamp("last_restocked_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Sales Transactions ───────────────────────────────────────────────────────

export const salesTransactions = pgTable("sales_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionNumber: varchar("transaction_number", { length: 50 })
    .notNull()
    .unique(),
  customerId: uuid("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  staffId: uuid("staff_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  amountTendered: numeric("amount_tendered", { precision: 10, scale: 2 }),
  changeAmount: numeric("change_amount", { precision: 10, scale: 2 }),
  amountPaid: numeric("amount_paid", { precision: 10, scale: 2 }),
  dueDate: date("due_date"),
  paymentMethod: paymentMethodEnum("payment_method").notNull().default("cash"),
  status: transactionStatusEnum("status").notNull().default("completed"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const salesTransactionItems = pgTable("sales_transaction_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: uuid("transaction_id")
    .notNull()
    .references(() => salesTransactions.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  lineTotal: numeric("line_total", { precision: 10, scale: 2 }).notNull(),
});

// ─── Services ─────────────────────────────────────────────────────────────────

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull().default(60),
  category: varchar("category", { length: 100 }).notNull().default("other"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Appointments ─────────────────────────────────────────────────────────────

export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  appointmentNumber: varchar("appointment_number", { length: 50 })
    .notNull()
    .unique(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id").references(() => services.id, {
    onDelete: "set null",
  }),
  staffId: uuid("staff_id").references(() => users.id, {
    onDelete: "set null",
  }),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: appointmentStatusEnum("status").notNull().default("scheduled"),
  notes: text("notes"),
  address: text("address"),
  remindedAt: timestamp("reminded_at"),
  downpaymentAmount: numeric("downpayment_amount", { precision: 10, scale: 2 }),
  downpaymentPaid: numeric("downpayment_paid", { precision: 10, scale: 2 }),
  downpaymentMethod: paymentMethodEnum("downpayment_method"),
  downpaymentPaidAt: timestamp("downpayment_paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Payments ─────────────────────────────────────────────────────────────────

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: uuid("transaction_id")
    .notNull()
    .references(() => salesTransactions.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  notes: text("notes"),
  recordedBy: uuid("recorded_by").references(() => users.id, {
    onDelete: "set null",
  }),
  paidAt: timestamp("paid_at").notNull().defaultNow(),
});

// ─── Requests ─────────────────────────────────────────────────────────────────

export const requests = pgTable("requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestNumber: varchar("request_number", { length: 50 }).notNull().unique(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  productDescription: text("product_description"),
  quantityRequested: integer("quantity_requested").notNull().default(1),
  status: requestStatusEnum("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  handledBy: uuid("handled_by").references(() => users.id, {
    onDelete: "set null",
  }),
  deliveryType: deliveryTypeEnum("delivery_type"),
  deliveryAddress: text("delivery_address"),
  deliveryDate: date("delivery_date"),
  driverId: uuid("driver_id").references(() => users.id, {
    onDelete: "set null",
  }),
  smsNotified: boolean("sms_notified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Orders (E-commerce) ──────────────────────────────────────────────────────

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }),
  customerId: uuid("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  deliveryType: deliveryTypeEnum("delivery_type").notNull(),
  deliveryAddress: text("delivery_address"),
  paymentMethod: paymentMethodEnum("payment_method").notNull().default("cash"),
  status: orderStatusEnum("status").notNull().default("pending"),
  paymentStatus: orderPaymentStatusEnum("payment_status")
    .notNull()
    .default("unpaid"),
  notes: text("notes"),
  handledBy: uuid("handled_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  lineTotal: numeric("line_total", { precision: 10, scale: 2 }).notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  handledTransactions: many(salesTransactions),
  handledRequests: many(requests, { relationName: "request_handler" }),
  drivenRequests: many(requests, { relationName: "request_driver" }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  transactions: many(salesTransactions),
  requests: many(requests),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  inventory: one(inventory),
  transactionItems: many(salesTransactionItems),
  requests: many(requests),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id],
  }),
}));

export const salesTransactionsRelations = relations(
  salesTransactions,
  ({ one, many }) => ({
    customer: one(customers, {
      fields: [salesTransactions.customerId],
      references: [customers.id],
    }),
    staff: one(users, {
      fields: [salesTransactions.staffId],
      references: [users.id],
    }),
    items: many(salesTransactionItems),
    payments: many(payments),
  }),
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  transaction: one(salesTransactions, {
    fields: [payments.transactionId],
    references: [salesTransactions.id],
  }),
  recorder: one(users, {
    fields: [payments.recordedBy],
    references: [users.id],
  }),
}));

export const salesTransactionItemsRelations = relations(
  salesTransactionItems,
  ({ one }) => ({
    transaction: one(salesTransactions, {
      fields: [salesTransactionItems.transactionId],
      references: [salesTransactions.id],
    }),
    product: one(products, {
      fields: [salesTransactionItems.productId],
      references: [products.id],
    }),
  }),
);

export const servicesRelations = relations(services, ({ many }) => ({
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  customer: one(customers, {
    fields: [appointments.customerId],
    references: [customers.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  staff: one(users, {
    fields: [appointments.staffId],
    references: [users.id],
  }),
}));

export const requestsRelations = relations(requests, ({ one }) => ({
  customer: one(customers, {
    fields: [requests.customerId],
    references: [customers.id],
  }),
  product: one(products, {
    fields: [requests.productId],
    references: [products.id],
  }),
  handler: one(users, {
    fields: [requests.handledBy],
    references: [users.id],
    relationName: "request_handler",
  }),
  driver: one(users, {
    fields: [requests.driverId],
    references: [users.id],
    relationName: "request_driver",
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  handler: one(users, {
    fields: [orders.handledBy],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
