import { SalesTable } from "@/features/sales/components/sales-table";

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sales History</h1>
        <p className="text-muted-foreground">
          View and manage all sales transactions.
        </p>
      </div>
      <SalesTable />
    </div>
  );
}
