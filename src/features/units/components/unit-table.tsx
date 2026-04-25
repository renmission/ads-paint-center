import { db } from "@/shared/lib/db";
import { units } from "@/shared/lib/db/schema";
import { asc, ilike, or, sql } from "drizzle-orm";
import { UnitTableClient } from "./unit-table-client";

export type UnitRow = {
  id: string;
  name: string;
  abbreviation: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const PAGE_SIZE = 10;

export async function UnitTable({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const search = searchParams.search?.trim() ?? "";
  const offset = (page - 1) * PAGE_SIZE;

  const where = search
    ? or(
        ilike(units.name, `%${search}%`),
        ilike(units.abbreviation, `%${search}%`),
      )
    : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(units)
      .where(where)
      .orderBy(asc(units.name))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(units)
      .where(where),
  ]);

  return (
    <UnitTableClient
      data={rows}
      totalCount={Number(countResult[0]?.count ?? 0)}
      page={page}
      pageSize={PAGE_SIZE}
      search={search}
    />
  );
}
