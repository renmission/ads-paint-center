import { db } from "@/shared/lib/db";
import { salesTransactions, customers, users } from "@/shared/lib/db/schema";
import { desc, eq, sql, and } from "drizzle-orm";
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

export async function ArTable() {
  const rows = await db
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
    .where(
      and(
        eq(salesTransactions.paymentMethod, "credit"),
        eq(salesTransactions.status, "completed"),
        sql`${salesTransactions.amountPaid} < ${salesTransactions.totalAmount}`,
      ),
    )
    .orderBy(desc(salesTransactions.createdAt));

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

  const totalOutstanding = data.reduce((sum, r) => sum + r.balance, 0);
  const overdueCount = data.filter((r) => r.isOverdue).length;

  const summary: ArSummary = {
    totalOutstanding,
    overdueCount,
    totalCount: data.length,
  };

  return <ArTableClient data={data} summary={summary} />;
}
