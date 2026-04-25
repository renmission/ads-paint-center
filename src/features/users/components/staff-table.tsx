import { db } from "@/shared/lib/db";
import { users } from "@/shared/lib/db/schema";
import { asc, ilike, or, sql } from "drizzle-orm";
import { StaffTableClient } from "./staff-table-client";

const PAGE_SIZE = 10;

export async function StaffTable({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const search = searchParams.search?.trim() ?? "";
  const offset = (page - 1) * PAGE_SIZE;

  const where = search
    ? or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))
    : undefined;

  const [data, countResult] = await Promise.all([
    db
      .select()
      .from(users)
      .where(where)
      .orderBy(asc(users.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(where),
  ]);

  return (
    <StaffTableClient
      data={data}
      totalCount={Number(countResult[0]?.count ?? 0)}
      page={page}
      pageSize={PAGE_SIZE}
      search={search}
    />
  );
}
