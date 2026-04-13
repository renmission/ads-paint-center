import { auth } from "@/shared/lib/auth";
import { getOrders } from "@/features/orders/queries";
import { OrdersTableClient } from "./orders-table-client";

export async function OrdersTable() {
  const session = await auth();
  const userRole = (session?.user?.role ?? "staff") as
    | "administrator"
    | "staff";

  const data = await getOrders();

  return <OrdersTableClient initialData={data} userRole={userRole} />;
}
