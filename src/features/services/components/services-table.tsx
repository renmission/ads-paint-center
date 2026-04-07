import { db } from "@/shared/lib/db";
import { services } from "@/shared/lib/db/schema";
import { desc } from "drizzle-orm";
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

export async function ServicesTable() {
  const session = await auth();
  const userRole = session?.user?.role ?? "staff";

  const rows = await db
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
    .orderBy(desc(services.createdAt));

  return (
    <ServicesTableClient
      initialData={rows}
      userRole={userRole as "administrator" | "staff"}
    />
  );
}
