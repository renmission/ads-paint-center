"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { addPaymentAction } from "../actions";
import type { SalesRow } from "./sales-table";
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
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Separator } from "@/shared/components/ui/separator";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: SalesRow | null;
}

function fmt(n: number | string) {
  return parseFloat(String(n)).toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

interface DialogInnerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: SalesRow;
}

function AddPaymentDialogInner({ open, onOpenChange, transaction }: DialogInnerProps) {
  const [state, formAction, isPending] = useActionState(addPaymentAction, undefined);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      onOpenChange(false);
    }
    if (state?.error) toast.error(state.error);
  }, [state, onOpenChange]);

  const total = parseFloat(transaction.totalAmount);
  const paid = parseFloat(transaction.amountPaid ?? "0");
  const balance = Math.max(0, total - paid);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
        </DialogHeader>

        <div className="text-sm space-y-1.5">
          <div className="flex justify-between text-muted-foreground">
            <span>Transaction</span>
            <span className="font-mono font-medium">{transaction.transactionNumber}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Total</span>
            <span className="tabular-nums">₱{fmt(transaction.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Paid</span>
            <span className="tabular-nums text-green-600">₱{fmt(paid)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Balance Due</span>
            <span className="tabular-nums text-amber-600">₱{fmt(balance)}</span>
          </div>
        </div>

        {/* key=transaction.id remounts the form when transaction changes, resetting defaultValues */}
        <form key={transaction.id} action={formAction} className="space-y-4">
          <input type="hidden" name="transactionId" value={transaction.id} />

          <div className="space-y-1.5">
            <Label htmlFor="paymentAmount">Payment Amount</Label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">₱</span>
              <Input
                id="paymentAmount"
                name="paymentAmount"
                type="number"
                min="0.01"
                step="0.01"
                max={balance}
                defaultValue={balance.toFixed(2)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Payment Method</Label>
            <input type="hidden" name="paymentMethod" value={paymentMethod} />
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="gcash">GCash</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Add a note…"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Recording…" : "Add Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddPaymentDialog({ open, onOpenChange, transaction }: Props) {
  if (!transaction) return null;
  return (
    <AddPaymentDialogInner
      open={open}
      onOpenChange={onOpenChange}
      transaction={transaction}
    />
  );
}
