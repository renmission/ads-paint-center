"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { voidSaleAction } from "../actions";
import type { SalesRow } from "./sales-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: SalesRow | null;
}

export function VoidSaleDialog({ open, onOpenChange, transaction }: Props) {
  const [state, formAction, isPending] = useActionState(voidSaleAction, undefined);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      onOpenChange(false);
    }
    if (state?.error) toast.error(state.error);
  }, [state, onOpenChange]);

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Void Transaction</DialogTitle>
          <DialogDescription>
            Are you sure you want to void{" "}
            <span className="font-mono font-semibold">{transaction.transactionNumber}</span>?
            This will restore all inventory quantities and cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border p-3 text-sm space-y-1 bg-muted/50">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer</span>
            <span>{transaction.customerName ?? "Walk-in"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-medium">
              ₱{parseFloat(transaction.totalAmount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Items</span>
            <span>{transaction.itemCount}</span>
          </div>
        </div>

        <form action={formAction}>
          <input type="hidden" name="transactionId" value={transaction.id} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? "Voiding…" : "Void Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
