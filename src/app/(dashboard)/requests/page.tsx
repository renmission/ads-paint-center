import { RequestsTable } from "@/features/requests/components/requests-table";

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Requests</h1>
        <p className="text-muted-foreground">
          Manage customer product requests.
        </p>
      </div>
      <RequestsTable searchParams={await searchParams} />
    </div>
  );
}
