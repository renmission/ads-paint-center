import { auth } from "@/shared/lib/auth";
import { getOrders } from "@/features/orders/queries";
import { OrdersTableClient } from "./orders-table-client";

export async function OrdersTable({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const session = await auth();
  const userRole = (session?.user?.role ?? "staff") as
    | "administrator"
    | "staff";

  const page = Math.max(1, Number(searchParams.page ?? 1));
  const search = searchParams.search?.trim() ?? "";

  const { data, totalCount } = await getOrders({ page, search });

  return (
    <OrdersTableClient
      data={data}
      totalCount={totalCount}
      page={page}
      pageSize={20}
      search={search}
      userRole={userRole}
    />
  );
}
