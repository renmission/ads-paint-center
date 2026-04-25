import { db } from "@/shared/lib/db";
import { services } from "@/shared/lib/db/schema";
import { desc, ilike, or, sql } from "drizzle-orm";
import { auth } from "@/shared/lib/auth";
import { ServicesTableClient } from "./services-table-client";

export type ServiceRow = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  duration: number;
  category: string;
  isActive: boolean;
  createdAt: Date;
};

const PAGE_SIZE = 10;

export async function ServicesTable({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const session = await auth();
  const userRole = session?.user?.role ?? "staff";

  const page = Math.max(1, Number(searchParams.page ?? 1));
  const search = searchParams.search?.trim() ?? "";
  const offset = (page - 1) * PAGE_SIZE;

  const where = search
    ? or(
        ilike(services.name, `%${search}%`),
        ilike(services.category, `%${search}%`),
      )
    : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select({
        id: services.id,
        name: services.name,
        description: services.description,
        price: services.price,
        duration: services.duration,
        category: services.category,
        isActive: services.isActive,
        createdAt: services.createdAt,
      })
      .from(services)
      .where(where)
      .orderBy(desc(services.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(services)
      .where(where),
  ]);

  return (
    <ServicesTableClient
      data={rows}
      totalCount={Number(countResult[0]?.count ?? 0)}
      page={page}
      pageSize={PAGE_SIZE}
      search={search}
      userRole={userRole as "administrator" | "staff"}
    />
  );
}
