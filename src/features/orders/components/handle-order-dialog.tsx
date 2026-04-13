"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { handleOrderAction } from "@/features/orders/actions";
import type { OrderRow } from "@/features/orders/queries";

type Action = "confirm" | "fulfil" | "cancel" | "mark_paid";

interface Props {
  order: OrderRow;
  action: Action;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACTION_LABELS: Record<Action, string> = {
  confirm: "Confirm Order",
  fulfil: "Mark as Fulfilled",
  cancel: "Cancel Order",
  mark_paid: "Mark as Paid",
};

const ACTION_DESCRIPTIONS: Record<Action, string> = {
  confirm: "This will confirm the order and notify the customer via SMS.",
  fulfil:
    "This will mark the order as fulfilled (delivered/picked up) and notify the customer.",
  cancel: "This will cancel the order and notify the customer via SMS.",
  mark_paid: "This will mark the order payment as received.",
};

export function HandleOrderDialog({
  order,
  action,
  open,
  onOpenChange,
}: Props) {
  const [state, formAction, pending] = useActionState(
    handleOrderAction,
    undefined,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{ACTION_LABELS[action]}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={order.id} />
          <input type="hidden" name="action" value={action} />

          <p className="text-sm text-slate-500">
            {ACTION_DESCRIPTIONS[action]}
          </p>
          <p className="rounded-md bg-slate-50 px-3 py-2 text-sm font-medium">
            {order.orderNumber} — {order.customerName}
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={order.notes ?? ""}
              placeholder="Internal notes..."
              rows={3}
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}
          {state?.success && (
            <p className="text-sm text-green-600">{state.success}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending}
              variant={action === "cancel" ? "destructive" : "default"}
            >
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {ACTION_LABELS[action]}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
