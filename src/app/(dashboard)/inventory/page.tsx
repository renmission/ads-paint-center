import { Suspense } from "react";
import { InventoryTable } from "@/features/inventory/components/inventory-table";

export default function InventoryPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">
          Manage your product catalog and stock levels.
        </p>
      </div>
      <Suspense
        fallback={
          <p className="text-muted-foreground text-sm">Loading inventory...</p>
        }
      >
        <InventoryTable />
      </Suspense>
    </div>
  );
}
