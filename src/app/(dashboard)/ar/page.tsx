import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { ArTable } from "@/features/sales/components/ar-table";

export default async function ArPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  if (session?.user?.role !== "administrator") redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Accounts Receivable
        </h1>
        <p className="text-muted-foreground">
          Outstanding credit invoices with unpaid balances.
        </p>
      </div>
      <ArTable searchParams={await searchParams} />
    </div>
  );
}
