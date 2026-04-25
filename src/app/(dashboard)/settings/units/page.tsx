import { UnitTable } from "@/features/units/components/unit-table";

export default async function UnitsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Units</h1>
        <p className="text-muted-foreground">
          Manage units of measure used in inventory products.
        </p>
      </div>
      <UnitTable searchParams={await searchParams} />
    </div>
  );
}
