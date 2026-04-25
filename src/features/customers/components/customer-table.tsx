import { db } from "@/shared/lib/db";
import { customers } from "@/shared/lib/db/schema";
import { asc, ilike, or, sql } from "drizzle-orm";
import { CustomerTableClient } from "./customer-table-client";

const PAGE_SIZE = 10;

export async function CustomerTable({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const search = searchParams.search?.trim() ?? "";
  const offset = (page - 1) * PAGE_SIZE;

  const where = search
    ? or(
        ilike(customers.name, `%${search}%`),
        ilike(customers.phone, `%${search}%`),
        ilike(customers.email, `%${search}%`),
      )
    : undefined;

  const [data, countResult] = await Promise.all([
    db
      .select()
      .from(customers)
      .where(where)
      .orderBy(asc(customers.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(customers)
      .where(where),
  ]);

  return (
    <CustomerTableClient
      data={data}
      totalCount={Number(countResult[0]?.count ?? 0)}
      page={page}
      pageSize={PAGE_SIZE}
      search={search}
    />
  );
}
