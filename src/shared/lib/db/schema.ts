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

export const userRoleEnum = pgEnum("user_role", ["administrator", "staff"]);

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
  })
);

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
  })
);

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
