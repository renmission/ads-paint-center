import { getOrderDetail } from "@/features/orders/queries";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";

export const metadata = { title: "Order Confirmed — ADS Paint Center" };

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderDetail(orderId);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
      <h2 className="mb-2 text-2xl font-bold text-slate-900">Order Placed!</h2>
      <p className="mb-1 text-slate-500">
        Thank you, <span className="font-medium">{order.customerName}</span>.
      </p>
      <p className="mb-8 text-sm text-slate-400">
        We&apos;ll send a confirmation SMS to{" "}
        <span className="font-medium">{order.customerPhone}</span>.
      </p>

      <div className="mb-8 rounded-xl border bg-white p-6 text-left">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-slate-500">Order Number</span>
          <span className="font-mono font-semibold text-slate-900">
            {order.orderNumber}
          </span>
        </div>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-slate-500">Fulfillment</span>
          <span className="capitalize font-medium">{order.deliveryType}</span>
        </div>
        {order.deliveryAddress && (
          <div className="mb-4 flex items-start justify-between gap-4">
            <span className="text-sm text-slate-500 shrink-0">Deliver to</span>
            <span className="text-right text-sm">{order.deliveryAddress}</span>
          </div>
        )}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-slate-500">Payment</span>
          <span className="capitalize font-medium">
            {order.paymentMethod === "gcash"
              ? "GCash"
              : order.paymentMethod === "cash"
                ? "Cash"
                : "Other"}{" "}
            (due on {order.deliveryType})
          </span>
        </div>

        <div className="border-t pt-4">
          <p className="mb-2 text-sm font-medium text-slate-700">Items</p>
          <ul className="space-y-1.5">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-slate-600">
                  {item.productName} × {item.quantity}
                </span>
                <span className="font-medium">
                  ₱{parseFloat(item.lineTotal).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between font-semibold">
            <span>Total</span>
            <span>₱{parseFloat(order.totalAmount).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Button asChild>
        <Link href="/shop">Continue Shopping</Link>
      </Button>
    </div>
  );
}
