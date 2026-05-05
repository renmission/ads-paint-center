"use client";

import { useEffect, useState } from "react";
import {
  Banknote,
  CheckCircle2,
  Loader2,
  PackageCheck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Separator } from "@/shared/components/ui/separator";
import { fetchOrderDetailAction } from "@/features/orders/actions";
import type { OrderDetail, OrderRow } from "@/features/orders/queries";

type Action = "confirm" | "fulfil" | "cancel" | "mark_paid";

const STATUS_LABEL: Record<OrderRow["status"], string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

interface Props {
  order: OrderRow;
  open: boolean;
  canManage: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (order: OrderRow, action: Action) => void;
}

export function OrderDetailsDialog({
  order,
  open,
  canManage,
  onOpenChange,
  onAction,
}: Props) {
  const [state, setState] = useState<{
    detail: OrderDetail | null;
    loading: boolean;
    error: string | null;
  }>({ detail: null, loading: false, error: null });

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setState({ detail: null, loading: true, error: null });
    });
    fetchOrderDetailAction(order.id).then((res) => {
      if (cancelled) return;
      setState({
        detail: res.data ?? null,
        loading: false,
        error: res.error ?? null,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [open, order.id]);

  const { detail, loading, error } = state;

  const showConfirm = canManage && order.status === "pending";
  const showFulfil = canManage && order.status === "confirmed";
  const showMarkPaid =
    canManage &&
    order.paymentStatus === "unpaid" &&
    order.status !== "cancelled";
  const showCancel =
    canManage && order.status !== "fulfilled" && order.status !== "cancelled";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-mono">{order.orderNumber}</span>
            <Badge variant="outline">{STATUS_LABEL[order.status]}</Badge>
            <Badge
              className={
                order.paymentStatus === "paid"
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }
            >
              {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Customer
              </p>
              <p className="font-medium">{order.customerName}</p>
              <p className="text-slate-500">{order.customerPhone}</p>
              {order.customerEmail && (
                <p className="text-slate-500">{order.customerEmail}</p>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Delivery
              </p>
              <p className="font-medium capitalize">{order.deliveryType}</p>
              {order.deliveryAddress && (
                <p className="text-slate-500">{order.deliveryAddress}</p>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Payment Method
              </p>
              <p className="font-medium capitalize">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Placed
              </p>
              <p className="font-medium">
                {order.createdAt.toLocaleString()}
              </p>
              {order.handlerName && (
                <p className="text-slate-500">Handled by {order.handlerName}</p>
              )}
            </div>
          </div>

          {order.notes && (
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Notes
              </p>
              <p className="rounded-md bg-slate-50 px-3 py-2 text-slate-700">
                {order.notes}
              </p>
            </div>
          )}

          <Separator />

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
              Items
            </p>
            {loading && (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading items…
              </div>
            )}
            {error && <p className="text-red-600">{error}</p>}
            {detail && (
              <div className="overflow-hidden rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">
                        Product
                      </th>
                      <th className="px-3 py-2 text-right font-medium">Qty</th>
                      <th className="px-3 py-2 text-right font-medium">
                        Unit Price
                      </th>
                      <th className="px-3 py-2 text-right font-medium">
                        Line Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.items.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-3 py-2">{item.productName}</td>
                        <td className="px-3 py-2 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2 text-right">
                          ₱{parseFloat(item.unitPrice).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          ₱{parseFloat(item.lineTotal).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex justify-end">
            <div className="w-56 space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>₱{parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>₱{parseFloat(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-wrap gap-2">
          {showCancel && (
            <Button
              variant="destructive"
              onClick={() => onAction(order, "cancel")}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Order
            </Button>
          )}
          {showConfirm && (
            <Button onClick={() => onAction(order, "confirm")}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirm Order
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
