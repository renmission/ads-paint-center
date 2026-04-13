"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  PackageCheck,
  MoreHorizontal,
  Banknote,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { HandleOrderDialog } from "./handle-order-dialog";
import type { OrderRow } from "@/features/orders/queries";

type Action = "confirm" | "fulfil" | "cancel" | "mark_paid";

const STATUS_BADGE: Record<
  OrderRow["status"],
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  pending: { label: "Pending", variant: "secondary" },
  confirmed: { label: "Confirmed", variant: "default" },
  fulfilled: { label: "Fulfilled", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

const PAYMENT_BADGE: Record<
  OrderRow["paymentStatus"],
  { label: string; className: string }
> = {
  unpaid: { label: "Unpaid", className: "bg-amber-100 text-amber-700" },
  paid: { label: "Paid", className: "bg-green-100 text-green-700" },
};

function StatusIcon({ status }: { status: OrderRow["status"] }) {
  if (status === "pending") return <Clock className="h-3.5 w-3.5" />;
  if (status === "confirmed") return <CheckCircle2 className="h-3.5 w-3.5" />;
  if (status === "fulfilled") return <PackageCheck className="h-3.5 w-3.5" />;
  return <XCircle className="h-3.5 w-3.5" />;
}

export function OrdersTableClient({
  initialData,
  userRole,
}: {
  initialData: OrderRow[];
  userRole: "administrator" | "staff";
}) {
  const [search, setSearch] = useState("");
  const [dialogOrder, setDialogOrder] = useState<OrderRow | null>(null);
  const [dialogAction, setDialogAction] = useState<Action>("confirm");

  const filtered = initialData.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q)
    );
  });

  function openDialog(order: OrderRow, action: Action) {
    setDialogOrder(order);
    setDialogAction(action);
  }

  return (
    <>
      <div className="mb-4">
        <Input
          placeholder="Search by order #, name, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              {userRole === "administrator" && (
                <TableHead className="w-[60px]" />
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={userRole === "administrator" ? 8 : 7}
                  className="py-10 text-center text-sm text-slate-400"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order) => {
                const statusBadge = STATUS_BADGE[order.status];
                const paymentBadge = PAYMENT_BADGE[order.paymentStatus];
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-xs text-slate-400">
                        {order.customerPhone}
                      </p>
                    </TableCell>
                    <TableCell className="capitalize text-sm">
                      {order.deliveryType}
                    </TableCell>
                    <TableCell className="font-medium">
                      ₱{parseFloat(order.totalAmount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusBadge.variant}
                        className="flex w-fit items-center gap-1"
                      >
                        <StatusIcon status={order.status} />
                        {statusBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${paymentBadge.className}`}
                      >
                        {paymentBadge.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {order.createdAt.toLocaleDateString()}
                    </TableCell>
                    {userRole === "administrator" && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {order.status === "pending" && (
                              <DropdownMenuItem
                                onClick={() => openDialog(order, "confirm")}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Confirm Order
                              </DropdownMenuItem>
                            )}
                            {order.status === "confirmed" && (
                              <DropdownMenuItem
                                onClick={() => openDialog(order, "fulfil")}
                              >
                                <PackageCheck className="mr-2 h-4 w-4" />
                                Mark Fulfilled
                              </DropdownMenuItem>
                            )}
                            {order.paymentStatus === "unpaid" &&
                              order.status !== "cancelled" && (
                                <DropdownMenuItem
                                  onClick={() => openDialog(order, "mark_paid")}
                                >
                                  <Banknote className="mr-2 h-4 w-4" />
                                  Mark Paid
                                </DropdownMenuItem>
                              )}
                            {order.status !== "fulfilled" &&
                              order.status !== "cancelled" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => openDialog(order, "cancel")}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Order
                                  </DropdownMenuItem>
                                </>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {dialogOrder && (
        <HandleOrderDialog
          order={dialogOrder}
          action={dialogAction}
          open={!!dialogOrder}
          onOpenChange={(open) => !open && setDialogOrder(null)}
        />
      )}
    </>
  );
}
