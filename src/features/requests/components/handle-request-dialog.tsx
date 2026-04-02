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
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Separator } from "@/shared/components/ui/separator";
import { Badge } from "@/shared/components/ui/badge";
import { CheckCircle, XCircle, PackageCheck } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: RequestRow | null;
}

const STATUS_CONFIG = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  approved: { label: "Approved", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  fulfilled: { label: "Fulfilled", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
} as const;

export function HandleRequestDialog({ open, onOpenChange, request }: Props) {
  const [state, formAction, isPending] = useActionState(handleRequestAction, undefined);
  const [pendingAction, setPendingAction] = useState<"approve" | "reject" | "fulfill" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      onOpenChange(false);
    }
    if (state?.error) toast.error(state.error);
  }, [state, onOpenChange]);

  if (!request) return null;

  const statusCfg = STATUS_CONFIG[request.status];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setPendingAction(null); setRejectionReason(""); } onOpenChange(o); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Handle Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono font-semibold">{request.requestNumber}</span>
            <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-y-1.5">
            <span className="text-muted-foreground">Customer</span>
            <span>{request.customerName}</span>
            <span className="text-muted-foreground">Phone</span>
            <span>{request.customerPhone}</span>
            <span className="text-muted-foreground">Product</span>
            <span>{request.productName ?? request.productDescription ?? "—"}</span>
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
          </div>
        </div>

        <Separator />

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={request.id} />
          <input type="hidden" name="action" value={pendingAction ?? ""} />
          <input type="hidden" name="rejectionReason" value={rejectionReason} />

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

          <DialogFooter className="flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => { setPendingAction(null); onOpenChange(false); }}>
              Close
            </Button>

            {request.status === "pending" && (
              <>
                {pendingAction === "reject" ? (
                  <>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setPendingAction(null)}>
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
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isPending}
                onClick={() => setPendingAction("fulfill")}
              >
                <PackageCheck className="mr-1.5 h-4 w-4" />
                {isPending ? "Fulfilling…" : "Mark as Fulfilled"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
