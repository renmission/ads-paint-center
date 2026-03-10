import { notFound } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { db } from "@/shared/lib/db";
import { customers, salesTransactions, requests } from "@/shared/lib/db/schema";
import { CustomerProfile } from "@/features/customers/components/customer-profile";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;

  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, id),
    with: {
      transactions: {
        orderBy: [desc(salesTransactions.createdAt)],
        limit: 20,
      },
      requests: {
        orderBy: [desc(requests.createdAt)],
        limit: 20,
      },
    },
  });

  if (!customer) notFound();

  return <CustomerProfile customer={customer} />;
}
