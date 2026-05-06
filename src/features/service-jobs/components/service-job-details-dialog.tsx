"use client";

import { useEffect, useState, useActionState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import {
  fetchServiceJobDetailAction,
  updateServiceJobStatusAction,
} from "../actions";
import type { ServiceJobDetail } from "../queries";

type ServiceJobStatus = ServiceJobDetail["status"];

const STATUS_CONFIG: Record<
  ServiceJobStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  },
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
};

interface Props {
  jobId: string | null;
  canManage: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function StatusUpdateForm({
  jobId,
  status,
  newStatus,
  label,
}: {
  jobId: string;
  status: ServiceJobStatus;
  newStatus: ServiceJobStatus;
  label: string;
}) {
  const [state, formAction, isPending] = useActionState(
    updateServiceJobStatusAction,
    undefined,
  );

  useEffect(() => {
    if (state?.success) toast.success(state.success);
    if (state?.error) toast.error(state.error);
  }, [state]);

  const isDisabled =
    isPending ||
    status === newStatus ||
    status === "completed" ||
    status === "cancelled";

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={jobId} />
      <input type="hidden" name="status" value={newStatus} />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={isDisabled}
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : label}
      </Button>
    </form>
  );
}

export function ServiceJobDetailsDialog({
  jobId,
  canManage,
  open,
  onOpenChange,
}: Props) {
  const [state, setState] = useState<{
    detail: ServiceJobDetail | null;
    loading: boolean;
    error: string | null;
  }>({ detail: null, loading: false, error: null });

  useEffect(() => {
    if (!open || !jobId) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setState({ detail: null, loading: true, error: null });
    });
    fetchServiceJobDetailAction(jobId).then((res) => {
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
  }, [open, jobId]);

  const { detail, loading, error } = state;

  const jobAddress = detail?.address || detail?.customerAddress;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            {detail ? (
              <>
                <span className="font-mono">{detail.jobNumber}</span>
                <Badge
                  className={
                    STATUS_CONFIG[detail.status].className
                  }
                >
                  {STATUS_CONFIG[detail.status].label}
                </Badge>
              </>
            ) : (
              <span className="text-muted-foreground">Service Job</span>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground py-6 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading job details…
          </div>
        )}

        {error && <p className="text-destructive text-sm py-4">{error}</p>}

        {detail && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                  Client
                </p>
                <p className="font-medium">{detail.customerName}</p>
                <p className="text-muted-foreground">{detail.customerPhone}</p>
                {detail.customerEmail && (
                  <p className="text-muted-foreground">{detail.customerEmail}</p>
                )}
                {detail.customerAddress && (
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {detail.customerAddress}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                  Service
                </p>
                <p className="font-medium">{detail.serviceName ?? "—"}</p>
                {jobAddress && (
                  <>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mt-2 mb-0.5">
                      Job Site
                    </p>
                    <p className="text-muted-foreground">{jobAddress}</p>
                  </>
                )}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                  Scheduled
                </p>
                <p className="font-medium">
                  {detail.scheduledAt
                    ? detail.scheduledAt.toLocaleString("en-PH", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Not yet scheduled"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                  Created
                </p>
                <p className="font-medium">
                  {detail.createdAt.toLocaleDateString("en-PH")}
                </p>
                {detail.handlerName && (
                  <p className="text-muted-foreground">
                    Handled by {detail.handlerName}
                  </p>
                )}
              </div>
            </div>

            {detail.notes && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  Notes
                </p>
                <p className="rounded-md bg-muted px-3 py-2 text-muted-foreground">
                  {detail.notes}
                </p>
              </div>
            )}

            <Separator />

            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                Breakdown
              </p>

              {!detail.servicePrice && detail.items.length === 0 ? (
                <p className="text-muted-foreground">No items recorded.</p>
              ) : (
                <div className="overflow-hidden rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">
                          Description
                        </th>
                        <th className="px-3 py-2 text-right font-medium">
                          Qty
                        </th>
                        <th className="px-3 py-2 text-right font-medium">
                          Unit Price
                        </th>
                        <th className="px-3 py-2 text-right font-medium">
                          Line Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.servicePrice && detail.serviceName && (
                        <tr className="border-t bg-muted/20">
                          <td className="px-3 py-2 font-medium">
                            {detail.serviceName}
                            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                              (service fee)
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">1</td>
                          <td className="px-3 py-2 text-right">
                            ₱{parseFloat(detail.servicePrice).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right font-medium">
                            ₱{parseFloat(detail.servicePrice).toFixed(2)}
                          </td>
                        </tr>
                      )}
                      {detail.items.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="px-3 py-2">
                            {item.description}
                            {item.productName &&
                              item.productName !== item.description && (
                                <span className="ml-1 text-xs text-muted-foreground">
                                  ({item.productName})
                                </span>
                              )}
                          </td>
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
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>
                    ₱{(
                      parseFloat(detail.totalAmount) +
                      (detail.servicePrice ? parseFloat(detail.servicePrice) : 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {canManage && (
              <>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground self-center mr-2">
                    Update Status:
                  </p>
                  <StatusUpdateForm
                    jobId={detail.id}
                    status={detail.status}
                    newStatus="scheduled"
                    label="Mark Scheduled"
                  />
                  <StatusUpdateForm
                    jobId={detail.id}
                    status={detail.status}
                    newStatus="in_progress"
                    label="Start Job"
                  />
                  <StatusUpdateForm
                    jobId={detail.id}
                    status={detail.status}
                    newStatus="completed"
                    label="Complete"
                  />
                  <StatusUpdateForm
                    jobId={detail.id}
                    status={detail.status}
                    newStatus="cancelled"
                    label="Cancel"
                  />
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
