import { Suspense } from "react";
import { ServicesTable } from "@/features/services/components/services-table";
import { ServiceJobsTab } from "@/features/service-jobs/components/service-jobs-tab";
import { ServicesTabs } from "./services-tabs";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const activeTab = params.tab ?? "jobs";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Services</h1>
        <p className="text-muted-foreground">
          {activeTab === "catalog"
            ? "Manage service catalog and pricing."
            : "Track and manage service jobs for clients."}
        </p>
      </div>

      <Suspense>
        <ServicesTabs />
      </Suspense>

      {activeTab === "catalog" ? (
        <ServicesTable searchParams={params} />
      ) : (
        <ServiceJobsTab searchParams={params} />
      )}
    </div>
  );
}
