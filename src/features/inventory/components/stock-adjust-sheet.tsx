"use client";

import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { adjustStockSchema, type AdjustStockInput } from "../schemas";
import { adjustStockAction } from "../actions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/shared/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import type { InventoryRow } from "./inventory-table";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: InventoryRow;
}

export function StockAdjustSheet({ open, onOpenChange, row }: Props) {
  const { product, inventory } = row;

  const [state, formAction, isPending] = useActionState(
    adjustStockAction,
    undefined,
  );

  const form = useForm<AdjustStockInput>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: {
      inventoryId: inventory!.id,
      productId: product.id,
      quantityOnHand: String(inventory!.quantityOnHand),
      lowStockThreshold: String(inventory!.lowStockThreshold),
    },
  });

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      onOpenChange(false);
    }
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Adjust Stock</SheetTitle>
          <SheetDescription>{product.name}</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form action={formAction} className="mt-6 space-y-6">
            <input type="hidden" name="inventoryId" value={inventory!.id} />
            <input type="hidden" name="productId" value={product.id} />

            <div className="rounded-md border p-4 space-y-1 text-sm">
              <p className="text-muted-foreground">Current stock</p>
              <p className="text-2xl font-bold">{inventory!.quantityOnHand}</p>
              <p className="text-xs text-muted-foreground">
                {product.unit}(s) on hand
              </p>
            </div>

            <FormField
              control={form.control}
              name="quantityOnHand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Quantity on Hand</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lowStockThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Low-Stock Alert Threshold</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="flex-col gap-2 sm:flex-col">
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Updating..." : "Update Stock"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
