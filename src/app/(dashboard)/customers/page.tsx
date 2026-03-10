import { CustomerTable } from "@/features/customers/components/customer-table";

export default async function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          Register and manage customer records.
        </p>
      </div>
      <CustomerTable />
    </div>
  );
}
