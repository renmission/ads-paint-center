import { db } from "@/shared/lib/db";
import { salesTransactions, customers, users } from "@/shared/lib/db/schema";
import { desc, eq, sql, gte, and, or, ilike } from "drizzle-orm";
import { auth } from "@/shared/lib/auth";
import { SalesTableClient } from "./sales-table-client";

export type SalesRow = {
  id: string;
  transactionNumber: string;
  createdAt: Date;
  customerName: string | null;
  staffName: string;
  itemCount: number;
  subtotal: string;
  discountAmount: string;
  totalAmount: string;
  amountTendered: string | null;
  changeAmount: string | null;
  amountPaid: string | null;
  dueDate: string | null;
  paymentMethod: "cash" | "gcash" | "credit" | "other";
  status: "pending" | "completed" | "voided";
  notes: string | null;
};

export type DailyStats = {
  revenue: number;
  transactionCount: number;
  averageSale: number;
};

const PAGE_SIZE = 10;

export async function SalesTable({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const session = await auth();
  const userRole = session?.user?.role ?? "staff";

  const page = Math.max(1, Number(searchParams.page ?? 1));
  const search = searchParams.search?.trim() ?? "";
  const status = searchParams.status ?? "all";
  const method = searchParams.method ?? "all";
  const offset = (page - 1) * PAGE_SIZE;

  const conditions = [];
  if (search)
    conditions.push(
      or(
        ilike(salesTransactions.transactionNumber, `%${search}%`),
        ilike(customers.name, `%${search}%`),
        ilike(users.name, `%${search}%`),
      ),
    );
  if (status !== "all")
    conditions.push(
      eq(
        salesTransactions.status,
        status as "pending" | "completed" | "voided",
      ),
    );
  if (method !== "all")
    conditions.push(
      eq(
        salesTransactions.paymentMethod,
        method as "cash" | "gcash" | "credit" | "other",
      ),
    );

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [rows, countResult, statsRows] = await Promise.all([
    db
      .select({
        id: salesTransactions.id,
        transactionNumber: salesTransactions.transactionNumber,
        createdAt: salesTransactions.createdAt,
        customerName: customers.name,
        staffName: users.name,
        subtotal: salesTransactions.subtotal,
        discountAmount: salesTransactions.discountAmount,
        totalAmount: salesTransactions.totalAmount,
        amountTendered: salesTransactions.amountTendered,
        changeAmount: salesTransactions.changeAmount,
        amountPaid: salesTransactions.amountPaid,
        dueDate: salesTransactions.dueDate,
        paymentMethod: salesTransactions.paymentMethod,
        status: salesTransactions.status,
        notes: salesTransactions.notes,
        itemCount: sql<number>`(
          SELECT COUNT(*) FROM sales_transaction_items
          WHERE transaction_id = ${salesTransactions.id}
        )`,
      })
      .from(salesTransactions)
      .leftJoin(customers, eq(salesTransactions.customerId, customers.id))
      .innerJoin(users, eq(salesTransactions.staffId, users.id))
      .where(where)
      .orderBy(desc(salesTransactions.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(salesTransactions)
      .leftJoin(customers, eq(salesTransactions.customerId, customers.id))
      .innerJoin(users, eq(salesTransactions.staffId, users.id))
      .where(where),
    db
      .select({
        totalRevenue: sql<string>`COALESCE(SUM(${salesTransactions.totalAmount}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(salesTransactions)
      .where(
        and(
          eq(salesTransactions.status, "completed"),
          gte(salesTransactions.createdAt, todayStart),
        ),
      ),
  ]);

  const data: SalesRow[] = rows.map((r) => ({
    ...r,
    customerName: r.customerName ?? null,
    itemCount: Number(r.itemCount),
    amountPaid: r.amountPaid ?? null,
    dueDate: r.dueDate ?? null,
  }));

  const revenue = parseFloat(statsRows[0]?.totalRevenue ?? "0");
  const count = Number(statsRows[0]?.count ?? 0);
  const dailyStats: DailyStats = {
    revenue,
    transactionCount: count,
    averageSale: count > 0 ? revenue / count : 0,
  };

  return (
    <SalesTableClient
      data={data}
      totalCount={Number(countResult[0]?.count ?? 0)}
      page={page}
      pageSize={PAGE_SIZE}
      search={search}
      status={status}
      method={method}
      userRole={userRole as "administrator" | "staff"}
      dailyStats={dailyStats}
    />
  );
}
