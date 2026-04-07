import { ServicesTable } from "@/features/services/components/services-table";

export default async function ServicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Services</h1>
        <p className="text-muted-foreground">Manage service catalog and pricing.</p>
      </div>
      <ServicesTable />
    </div>
  );
}
