"use client";

import { useEffect, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { placeOrderAction } from "@/features/orders/actions";
import type { CartItem } from "@/features/orders/schemas";

export function CheckoutForm() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">(
    "pickup",
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "gcash" | "other"
  >("cash");

  const [state, formAction, pending] = useActionState(
    placeOrderAction,
    undefined,
  );

  useEffect(() => {
    const stored = sessionStorage.getItem("ads_cart");
    if (stored) {
      try {
        setCart(JSON.parse(stored) as CartItem[]);
      } catch {
        setCart([]);
      }
    }
    setCartLoaded(true);
  }, []);

  useEffect(() => {
    if (state?.orderId) {
      sessionStorage.removeItem("ads_cart");
      router.push(`/checkout/success/${state.orderId}`);
    }
  }, [state, router]);

  const subtotal = cart.reduce((s, i) => s + i.lineTotal, 0);

  if (!cartLoaded) return null;

  if (cart.length === 0) {
    return (
      <div className="py-24 text-center">
        <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-slate-300" />
        <p className="mb-4 text-slate-500">Your cart is empty.</p>
        <Button variant="outline" onClick={() => router.push("/shop")}>
          Back to Shop
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* Left — form */}
      <div>
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Checkout</h2>
        <form action={formAction} className="space-y-6">
          {/* Hidden fields */}
          <input type="hidden" name="cartJson" value={JSON.stringify(cart)} />
          <input type="hidden" name="deliveryType" value={deliveryType} />
          <input type="hidden" name="paymentMethod" value={paymentMethod} />

          {/* Contact info */}
          <section className="rounded-xl border bg-white p-5">
            <h3 className="mb-4 font-semibold text-slate-800">
              Contact Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  placeholder="Juan Dela Cruz"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  placeholder="09XX XXX XXXX"
                  required
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="customerEmail">Email (optional)</Label>
                <Input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  placeholder="juan@example.com"
                />
              </div>
            </div>
          </section>

          {/* Delivery */}
          <section className="rounded-xl border bg-white p-5">
            <h3 className="mb-4 font-semibold text-slate-800">Delivery</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Fulfillment Type *</Label>
                <Select
                  value={deliveryType}
                  onValueChange={(v) =>
                    setDeliveryType(v as "pickup" | "delivery")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup">Pick-up at store</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {deliveryType === "delivery" && (
                <div className="space-y-1.5">
                  <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                  <Textarea
                    id="deliveryAddress"
                    name="deliveryAddress"
                    placeholder="Street, Barangay, City"
                    rows={3}
                  />
                </div>
              )}
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-xl border bg-white p-5">
            <h3 className="mb-4 font-semibold text-slate-800">Payment</h3>
            <div className="space-y-1.5">
              <Label>Payment Method *</Label>
              <Select
                value={paymentMethod}
                onValueChange={(v) =>
                  setPaymentMethod(v as "cash" | "gcash" | "other")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    Cash on delivery / pickup
                  </SelectItem>
                  <SelectItem value="gcash">GCash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-400">
                Payment is collected upon{" "}
                {deliveryType === "delivery" ? "delivery" : "pickup"}.
              </p>
            </div>
          </section>

          {/* Notes */}
          <section className="rounded-xl border bg-white p-5">
            <h3 className="mb-4 font-semibold text-slate-800">
              Order Notes (optional)
            </h3>
            <Textarea
              name="notes"
              placeholder="Any special instructions..."
              rows={3}
            />
          </section>

          {state?.error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {state.error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Place Order — ₱{subtotal.toFixed(2)}
          </Button>
        </form>
      </div>

      {/* Right — order summary */}
      <div className="lg:sticky lg:top-6 h-fit rounded-xl border bg-white p-5">
        <h3 className="mb-4 font-semibold text-slate-800">Order Summary</h3>
        <ul className="space-y-3">
          {cart.map((item) => (
            <li
              key={item.productId}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.productName}</p>
                <p className="text-slate-400">
                  {item.quantity} × ₱{item.unitPrice.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-semibold">
                  ₱{item.lineTotal.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCart((prev) =>
                      prev.filter((i) => i.productId !== item.productId),
                    )
                  }
                  className="text-slate-300 hover:text-red-500 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t pt-4 flex items-center justify-between font-semibold">
          <span>Total</span>
          <span>₱{subtotal.toFixed(2)}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-4 w-full text-slate-400"
          onClick={() => router.push("/shop")}
        >
          ← Back to shop
        </Button>
      </div>
    </div>
  );
}
