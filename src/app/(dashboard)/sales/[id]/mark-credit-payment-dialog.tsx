"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { markCreditPaymentAction } from "@/features/sales/actions";
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
import { CreditCard } from "lucide-react";

interface Props {
  transactionId: string;
  balance: number;
}

function fmt(n: number) {
  return n.toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

interface DialogInnerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  balance: number;
}

function MarkCreditPaymentDialogInner({ open, onOpenChange, transactionId, balance }: DialogInnerProps) {
  const [state, formAction, isPending] = useActionState(markCreditPaymentAction, undefined);
  const [paymentAmount, setPaymentAmount] = useState(balance.toFixed(2));
  const [paymentMethod, setPaymentMethod] = useState("cash");

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      onOpenChange(false);
    }
    if (state?.error) toast.error(state.error);
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Record Credit Payment</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="transactionId" value={transactionId} />
          <div className="space-y-1.5">
            <Label>Outstanding Balance</Label>
            <p className="text-lg font-bold tabular-nums">₱{fmt(balance)}</p>
          </div>
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
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Recording…" : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MarkCreditPaymentDialog({ transactionId, balance }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <CreditCard className="mr-1.5 h-4 w-4" />
        Record Payment
      </Button>
      <MarkCreditPaymentDialogInner
        open={open}
        onOpenChange={setOpen}
        transactionId={transactionId}
        balance={balance}
      />
    </>
  );
}
