import { Suspense } from "react";
import { ShoppingBag } from "lucide-react";
import { OrdersTable } from "@/features/orders/components/orders-table";

export const metadata = { title: "Online Orders — ADS Paint Center" };

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingBag className="h-6 w-6 text-slate-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Online Orders</h1>
          <p className="text-sm text-slate-500">
            Manage orders placed through the online store
          </p>
        </div>
      </div>

      <Suspense fallback={<p className="text-sm text-slate-400">Loading…</p>}>
        <OrdersTable />
      </Suspense>
    </div>
  );
}
