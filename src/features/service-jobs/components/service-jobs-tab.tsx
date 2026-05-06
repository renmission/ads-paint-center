import { auth } from "@/shared/lib/auth";
import { getServiceJobs, getFormOptions } from "../queries";
import { ServiceJobsTableClient } from "./service-jobs-table-client";

const PAGE_SIZE = 10;

export async function ServiceJobsTab({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const session = await auth();
  const userRole =
    (session?.user?.role as "administrator" | "staff") ?? "staff";

  const page = Math.max(1, Number(searchParams.page ?? 1));
  const search = searchParams.search?.trim() ?? "";

  const [{ data, totalCount }, formOptions] = await Promise.all([
    getServiceJobs({ page, search }),
    getFormOptions(),
  ]);

  return (
    <ServiceJobsTableClient
      data={data}
      totalCount={totalCount}
      page={page}
      pageSize={PAGE_SIZE}
      search={search}
      userRole={userRole}
      customers={formOptions.allCustomers}
      servicesList={formOptions.activeServices}
      staffList={formOptions.staffList}
      products={formOptions.activeProducts}
    />
  );
}
