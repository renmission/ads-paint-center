"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { handleRequestAction } from "../actions";
import type { RequestRow } from "./requests-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Separator } from "@/shared/components/ui/separator";
import { Badge } from "@/shared/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  PackageCheck,
  Truck,
  MapPin,
  Calendar,
} from "lucide-react";

type StaffMember = { id: string; name: string };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: RequestRow | null;
  staffList: StaffMember[];
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  approved: {
    label: "Approved",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    className:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
  fulfilled: {
    label: "Fulfilled",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
} as const;

export function HandleRequestDialog({
  open,
  onOpenChange,
  request,
  staffList,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    handleRequestAction,
    undefined,
  );
  const [pendingAction, setPendingAction] = useState<
    "approve" | "reject" | "fulfill" | "mark_out_for_delivery" | null
  >(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [driverId, setDriverId] = useState("");

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      onOpenChange(false);
    }
    if (state?.error) toast.error(state.error);
  }, [state, onOpenChange]);

  const handleClose = (o: boolean) => {
    if (!o) {
      setPendingAction(null);
      setRejectionReason("");
      setDriverId("");
    }
    onOpenChange(o);
  };

  if (!request) return null;

  const statusCfg = STATUS_CONFIG[request.status];
  const isDelivery = request.deliveryType === "delivery";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Handle Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono font-semibold">
              {request.requestNumber}
            </span>
            <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-y-1.5">
            <span className="text-muted-foreground">Customer</span>
            <span>{request.customerName}</span>
            <span className="text-muted-foreground">Phone</span>
            <span>{request.customerPhone}</span>
            <span className="text-muted-foreground">Product</span>
            <span>
              {request.productName ?? request.productDescription ?? "—"}
            </span>
            <span className="text-muted-foreground">Quantity</span>
            <span>{request.quantityRequested}</span>
            <span className="text-muted-foreground">Submitted</span>
            <span>
              {new Date(request.createdAt).toLocaleDateString("en-PH", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {request.deliveryType && (
              <>
                <span className="text-muted-foreground">Fulfillment</span>
                <span className="capitalize">{request.deliveryType}</span>
              </>
            )}
            {request.deliveryAddress && (
              <>
                <span className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Address
                </span>
                <span>{request.deliveryAddress}</span>
              </>
            )}
            {request.deliveryDate && (
              <>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Delivery Date
                </span>
                <span>
                  {new Date(request.deliveryDate).toLocaleDateString("en-PH", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </>
            )}
            {request.driverName && (
              <>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Truck className="h-3 w-3" /> Driver
                </span>
                <span>{request.driverName}</span>
              </>
            )}
          </div>
        </div>

        <Separator />

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={request.id} />
          <input type="hidden" name="action" value={pendingAction ?? ""} />
          <input type="hidden" name="rejectionReason" value={rejectionReason} />
          <input type="hidden" name="driverId" value={driverId} />

          {pendingAction === "reject" && (
            <div className="space-y-1.5">
              <Label>Rejection Reason</Label>
              <Textarea
                placeholder="Explain why this request is being rejected…"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {pendingAction === "approve" && isDelivery && (
            <div className="space-y-1.5">
              <Label>Assign Driver (optional)</Label>
              <Select value={driverId} onValueChange={setDriverId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select driver…" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPendingAction(null);
                onOpenChange(false);
              }}
            >
              Close
            </Button>

            {request.status === "pending" && (
              <>
                {pendingAction === "reject" ? (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingAction(null)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={isPending || !rejectionReason.trim()}
                    >
                      <XCircle className="mr-1.5 h-4 w-4" />
                      {isPending ? "Rejecting…" : "Confirm Reject"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                      onClick={() => setPendingAction("reject")}
                    >
                      <XCircle className="mr-1.5 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={isPending}
                      onClick={() => setPendingAction("approve")}
                    >
                      <CheckCircle className="mr-1.5 h-4 w-4" />
                      {isPending ? "Approving…" : "Approve"}
                    </Button>
                  </>
                )}
              </>
            )}

            {request.status === "approved" && (
              <>
                {isDelivery && (
                  <Button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={isPending}
                    onClick={() => setPendingAction("mark_out_for_delivery")}
                  >
                    <Truck className="mr-1.5 h-4 w-4" />
                    {isPending ? "Updating…" : "Mark Out for Delivery"}
                  </Button>
                )}
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isPending}
                  onClick={() => setPendingAction("fulfill")}
                >
                  <PackageCheck className="mr-1.5 h-4 w-4" />
                  {isPending ? "Fulfilling…" : "Mark as Fulfilled"}
                </Button>
              </>
            )}

            {request.status === "out_for_delivery" && (
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isPending}
                onClick={() => setPendingAction("fulfill")}
              >
                <PackageCheck className="mr-1.5 h-4 w-4" />
                {isPending ? "Completing…" : "Mark as Delivered"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
