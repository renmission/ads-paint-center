import { db } from "@/shared/lib/db";
import { customers } from "@/shared/lib/db/schema";
import { asc } from "drizzle-orm";
import { CustomerTableClient } from "./customer-table-client";

export async function CustomerTable() {
  const allCustomers = await db
    .select()
    .from(customers)
    .orderBy(asc(customers.createdAt));

  return <CustomerTableClient initialData={allCustomers} />;
}
