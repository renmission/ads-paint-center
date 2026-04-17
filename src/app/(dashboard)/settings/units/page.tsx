import { UnitTable } from "@/features/units/components/unit-table";

export default function UnitsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Units</h1>
        <p className="text-muted-foreground">
          Manage units of measure used in inventory products.
        </p>
      </div>
      <UnitTable />
    </div>
  );
}
