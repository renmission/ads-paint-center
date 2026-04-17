import { db } from "@/shared/lib/db";
import { units } from "@/shared/lib/db/schema";
import { asc } from "drizzle-orm";
import { UnitTableClient } from "./unit-table-client";

export type UnitRow = {
  id: string;
  name: string;
  abbreviation: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function UnitTable() {
  const rows = await db.select().from(units).orderBy(asc(units.name));

  return <UnitTableClient initialData={rows} />;
}
