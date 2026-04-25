import { db } from "@/shared/lib/db";
import { salesTransactions, customers, users } from "@/shared/lib/db/schema";
import { desc, eq, sql, and, or, ilike } from "drizzle-orm";
import { ArTableClient } from "./ar-table-client";

export type ArRow = {
  id: string;
  transactionNumber: string;
  createdAt: Date;
  dueDate: string | null;
  customerName: string | null;
  customerId: string | null;
  staffName: string;
  totalAmount: string;
  amountPaid: string;
  balance: number;
  isOverdue: boolean;
};

export type ArSummary = {
  totalOutstanding: number;
  overdueCount: number;
  totalCount: number;
};

const PAGE_SIZE = 10;

const BASE_WHERE = and(
  eq(salesTransactions.paymentMethod, "credit"),
  eq(salesTransactions.status, "completed"),
  sql`${salesTransactions.amountPaid} < ${salesTransactions.totalAmount}`,
);

export async function ArTable({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const search = searchParams.search?.trim() ?? "";
  const overdue = searchParams.overdue ?? "all";
  const offset = (page - 1) * PAGE_SIZE;

  const conditions = [BASE_WHERE];
  if (search)
    conditions.push(
      or(
        ilike(salesTransactions.transactionNumber, `%${search}%`),
        ilike(customers.name, `%${search}%`),
      ),
    );
  if (overdue === "overdue")
    conditions.push(
      sql`${salesTransactions.dueDate} IS NOT NULL AND ${salesTransactions.dueDate}::date < CURRENT_DATE`,
    );
  if (overdue === "current")
    conditions.push(
      sql`(${salesTransactions.dueDate} IS NULL OR ${salesTransactions.dueDate}::date >= CURRENT_DATE)`,
    );

  const where = and(...conditions);

  const [rows, countResult, summaryResult] = await Promise.all([
    db
      .select({
        id: salesTransactions.id,
        transactionNumber: salesTransactions.transactionNumber,
        createdAt: salesTransactions.createdAt,
        dueDate: salesTransactions.dueDate,
        customerName: customers.name,
        customerId: salesTransactions.customerId,
        staffName: users.name,
        totalAmount: salesTransactions.totalAmount,
        amountPaid: salesTransactions.amountPaid,
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
      .where(where),
    // Summary stats always computed over ALL AR records (no search/overdue filter)
    db
      .select({
        totalOutstanding: sql<string>`COALESCE(SUM(${salesTransactions.totalAmount}::numeric - COALESCE(${salesTransactions.amountPaid}::numeric, 0)), 0)`,
        overdueCount: sql<number>`COUNT(*) FILTER (WHERE ${salesTransactions.dueDate} IS NOT NULL AND ${salesTransactions.dueDate}::date < CURRENT_DATE)`,
        totalCount: sql<number>`COUNT(*)`,
      })
      .from(salesTransactions)
      .where(BASE_WHERE),
  ]);

  const now = new Date();

  const data: ArRow[] = rows.map((r) => {
    const total = parseFloat(r.totalAmount);
    const paid = parseFloat(r.amountPaid ?? "0");
    const balance = Math.max(0, total - paid);
    const isOverdue = r.dueDate
      ? new Date(r.dueDate) < now && balance > 0
      : false;
    return {
      id: r.id,
      transactionNumber: r.transactionNumber,
      createdAt: r.createdAt,
      dueDate: r.dueDate ?? null,
      customerName: r.customerName ?? null,
      customerId: r.customerId ?? null,
      staffName: r.staffName,
      totalAmount: r.totalAmount,
      amountPaid: r.amountPaid ?? "0",
      balance,
      isOverdue,
    };
  });

  const summary: ArSummary = {
    totalOutstanding: parseFloat(summaryResult[0]?.totalOutstanding ?? "0"),
    overdueCount: Number(summaryResult[0]?.overdueCount ?? 0),
    totalCount: Number(summaryResult[0]?.totalCount ?? 0),
  };

  return (
    <ArTableClient
      data={data}
      totalCount={Number(countResult[0]?.count ?? 0)}
      page={page}
      pageSize={PAGE_SIZE}
      search={search}
      overdue={overdue}
      summary={summary}
    />
  );
}
