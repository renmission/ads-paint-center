import { db } from "@/shared/lib/db";
import { users } from "@/shared/lib/db/schema";
import { asc } from "drizzle-orm";
import { StaffTableClient } from "./staff-table-client";

export async function StaffTable() {
  const staff = await db
    .select()
    .from(users)
    .orderBy(asc(users.createdAt));

  return <StaffTableClient initialData={staff} />;
}
