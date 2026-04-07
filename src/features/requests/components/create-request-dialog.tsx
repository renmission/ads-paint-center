"use client";

import { useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createRequestSchema, type CreateRequestInput } from "../schemas";
import { createRequestAction } from "../actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";

type Customer = { id: string; name: string; phone: string };
type Product = { id: string; name: string; sku: string | null };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Customer[];
  products: Product[];
}

export function CreateRequestDialog({ open, onOpenChange, customers, products }: Props) {
  const [state, formAction, isPending] = useActionState(createRequestAction, undefined);
  const [productMode, setProductMode] = useState<"select" | "describe">("select");
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery" | "">("");

  const form = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      customerId: "",
      productId: "",
      productDescription: "",
      quantityRequested: "1",
      deliveryType: undefined,
      deliveryAddress: "",
      deliveryDate: "",
    },
  });

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      onOpenChange(false);
    }
    if (state?.error) toast.error(state.error);
  }, [state, onOpenChange]);

  const handleClose = (o: boolean) => {
    if (!o) {
      form.reset();
      setProductMode("select");
      setDeliveryType("");
    }
    onOpenChange(o);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Request</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form action={formAction} className="space-y-4">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <input type="hidden" name="customerId" value={field.value} />
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer…" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} — {c.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={productMode === "select" ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setProductMode("select"); form.setValue("productDescription", ""); }}
                >
                  Select Product
                </Button>
                <Button
                  type="button"
                  variant={productMode === "describe" ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setProductMode("describe"); form.setValue("productId", ""); }}
                >
                  Describe Product
                </Button>
              </div>

              {productMode === "select" ? (
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <input type="hidden" name="productId" value={field.value} />
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product…" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                              {p.sku ? ` (${p.sku})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="productDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the product being requested…"
                          {...field}
                          name="productDescription"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {productMode === "select" && (
                <input type="hidden" name="productDescription" value="" />
              )}
              {productMode === "describe" && (
                <input type="hidden" name="productId" value="" />
              )}
            </div>

            <FormField
              control={form.control}
              name="quantityRequested"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity Requested</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      {...field}
                      name="quantityRequested"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Delivery / Pickup */}
            <div className="space-y-3">
              <Label>Fulfillment Method</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={deliveryType === "pickup" ? "default" : "outline"}
                  onClick={() => setDeliveryType("pickup")}
                >
                  Pickup
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={deliveryType === "delivery" ? "default" : "outline"}
                  onClick={() => setDeliveryType("delivery")}
                >
                  Delivery
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={deliveryType === "" ? "default" : "outline"}
                  onClick={() => setDeliveryType("")}
                >
                  Not specified
                </Button>
              </div>
              <input type="hidden" name="deliveryType" value={deliveryType} />

              {deliveryType === "delivery" && (
                <>
                  <FormField
                    control={form.control}
                    name="deliveryAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Full delivery address…"
                            rows={2}
                            {...field}
                            name="deliveryAddress"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deliveryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Delivery Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            name="deliveryDate"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              {deliveryType !== "delivery" && (
                <>
                  <input type="hidden" name="deliveryAddress" value="" />
                  <input type="hidden" name="deliveryDate" value="" />
                </>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Submitting…" : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
