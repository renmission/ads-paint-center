"use client";

import { useState, useActionState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Dialog as DialogPrimitive } from "radix-ui";
import { completeSaleAction } from "../actions";
import type { CartItem } from "../schemas";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Trash2, Plus, Minus, Search, X, ShoppingCart, Package } from "lucide-react";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  price: string;
  category: string;
  quantityOnHand: number;
};

type Customer = {
  id: string;
  name: string;
  phone: string;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  customers: Customer[];
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  paint:   { bg: "bg-orange-50 dark:bg-orange-950/30",   text: "text-orange-700 dark:text-orange-300",   dot: "bg-orange-400" },
  coating: { bg: "bg-blue-50 dark:bg-blue-950/30",       text: "text-blue-700 dark:text-blue-300",       dot: "bg-blue-400" },
  primer:  { bg: "bg-green-50 dark:bg-green-950/30",     text: "text-green-700 dark:text-green-300",     dot: "bg-green-400" },
  varnish: { bg: "bg-yellow-50 dark:bg-yellow-950/30",   text: "text-yellow-700 dark:text-yellow-300",   dot: "bg-yellow-400" },
  thinner: { bg: "bg-purple-50 dark:bg-purple-950/30",   text: "text-purple-700 dark:text-purple-300",   dot: "bg-purple-400" },
  tool:    { bg: "bg-slate-50 dark:bg-slate-800/50",     text: "text-slate-700 dark:text-slate-300",     dot: "bg-slate-400" },
  supply:  { bg: "bg-teal-50 dark:bg-teal-950/30",       text: "text-teal-700 dark:text-teal-300",       dot: "bg-teal-400" },
  other:   { bg: "bg-rose-50 dark:bg-rose-950/30",       text: "text-rose-700 dark:text-rose-300",       dot: "bg-rose-400" },
};

const CATEGORY_LABELS: Record<string, string> = {
  paint: "Paint", coating: "Coating", primer: "Primer", varnish: "Varnish",
  thinner: "Thinner", tool: "Tool", supply: "Supply", other: "Other",
};

const CATEGORY_BANNER: Record<string, string> = {
  paint:   "from-orange-200 to-orange-100 dark:from-orange-900/40 dark:to-orange-800/20",
  coating: "from-blue-200 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/20",
  primer:  "from-green-200 to-green-100 dark:from-green-900/40 dark:to-green-800/20",
  varnish: "from-yellow-200 to-yellow-100 dark:from-yellow-900/40 dark:to-yellow-800/20",
  thinner: "from-purple-200 to-purple-100 dark:from-purple-900/40 dark:to-purple-800/20",
  tool:    "from-slate-200 to-slate-100 dark:from-slate-700/40 dark:to-slate-600/20",
  supply:  "from-teal-200 to-teal-100 dark:from-teal-900/40 dark:to-teal-800/20",
  other:   "from-rose-200 to-rose-100 dark:from-rose-900/40 dark:to-rose-800/20",
};

const ALL_CATEGORIES = ["paint", "coating", "primer", "varnish", "thinner", "tool", "supply", "other"];

export function PosSheet({ open, onOpenChange, products, customers }: Props) {
  const [state, formAction, isPending] = useActionState(completeSaleAction, undefined);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState("walk-in");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "gcash" | "credit" | "other">("cash");
  const [amountTendered, setAmountTendered] = useState("0");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const resetSheet = useCallback(() => {
    setCart([]);
    setCustomerId("walk-in");
    setDiscountAmount("0");
    setPaymentMethod("cash");
    setAmountTendered("0");
    setNotes("");
    setSearch("");
    setActiveCategory("all");
  }, []);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      onOpenChange(false);
    }
    if (state?.error) toast.error(state.error);
  }, [state, onOpenChange]);

  const visibleCategories = useMemo(
    () => ALL_CATEGORIES.filter((c) => products.some((p) => p.category === c)),
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = activeCategory === "all" || p.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.sku?.toLowerCase().includes(q) ?? false);
      return matchCat && matchSearch;
    });
  }, [products, activeCategory, search]);

  function addToCart(product: Product) {
    const unitPrice = parseFloat(product.price);
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.productId === product.id);
      if (idx >= 0) {
        return prev.map((i, n) =>
          n === idx ? { ...i, quantity: i.quantity + 1, lineTotal: (i.quantity + 1) * i.unitPrice } : i
        );
      }
      return [...prev, { productId: product.id, productName: product.name, quantity: 1, unitPrice, lineTotal: unitPrice }];
    });
  }

  function updateQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + delta, lineTotal: (i.quantity + delta) * i.unitPrice }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }

  function removeItem(productId: string) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  const subtotal = cart.reduce((sum, i) => sum + i.lineTotal, 0);
  const discount = Math.max(0, parseFloat(discountAmount) || 0);
  const total = Math.max(0, subtotal - discount);
  const tendered = parseFloat(amountTendered) || 0;
  const change = paymentMethod === "cash" ? tendered - total : 0;
  const fmt = (n: number) => n.toLocaleString("en-PH", { minimumFractionDigits: 2 });

  const cartQtyFor = (id: string) => cart.find((i) => i.productId === id)?.quantity ?? 0;

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) resetSheet();
        onOpenChange(o);
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content className="fixed inset-0 z-50 bg-background flex flex-col outline-none">
          {/* Accessible title for screen readers */}
          <DialogPrimitive.Title className="sr-only">New Sale — Point of Sale</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Select products to add to the cart and complete a sale transaction.
          </DialogPrimitive.Description>

          {/* Hidden form inputs */}
          <form id="pos-form" action={formAction}>
            <input type="hidden" name="cartJson" value={JSON.stringify(cart)} />
            <input type="hidden" name="customerId" value={customerId === "walk-in" ? "" : customerId} />
            <input type="hidden" name="discountAmount" value={discountAmount} />
            <input type="hidden" name="paymentMethod" value={paymentMethod} />
            <input type="hidden" name="amountTendered" value={amountTendered} />
            <input type="hidden" name="notes" value={notes} />
          </form>

          <div className="flex flex-1 overflow-hidden">
            {/* ── LEFT PANEL: Product Catalog ─────────────────────── */}
            <div className="flex flex-col flex-1 min-w-0 bg-muted/20">
              {/* Top bar */}
              <div className="flex items-center gap-3 px-6 py-3.5 bg-background border-b shadow-sm">
                <div className="shrink-0">
                  <h2 className="text-base font-semibold leading-none">New Sale</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Click a product to add to cart</p>
                </div>
                <div className="relative flex-1 max-w-lg mx-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or SKU…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 bg-muted/50 border-muted-foreground/20 focus-visible:bg-background"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 rounded-full"
                  onClick={() => { resetSheet(); onOpenChange(false); }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Category pills */}
              <div className="flex gap-2 px-6 py-2.5 border-b bg-background/80 overflow-x-auto scrollbar-hide">
                <button
                  type="button"
                  onClick={() => setActiveCategory("all")}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    activeCategory === "all"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  All Products
                </button>
                {visibleCategories.map((cat) => {
                  const s = CATEGORY_STYLES[cat] ?? CATEGORY_STYLES.other;
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : `${s.bg} ${s.text} hover:opacity-80`
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-primary-foreground/70" : s.dot}`} />
                      {CATEGORY_LABELS[cat] ?? cat}
                    </button>
                  );
                })}
              </div>

              {/* Product grid */}
              <div className="flex-1 overflow-y-auto p-5">
                {filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                    <Package className="h-12 w-12 opacity-20" />
                    <p className="text-sm font-medium">No products found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                    {filteredProducts.map((product) => {
                      const style = CATEGORY_STYLES[product.category] ?? CATEGORY_STYLES.other;
                      const banner = CATEGORY_BANNER[product.category] ?? CATEGORY_BANNER.other;
                      const inCart = cartQtyFor(product.id);
                      const isLowStock = product.quantityOnHand > 0 && product.quantityOnHand <= 10;
                      const isOutOfStock = product.quantityOnHand === 0;
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => !isOutOfStock && addToCart(product)}
                          disabled={isOutOfStock}
                          className={`group relative flex flex-col rounded-xl overflow-hidden border bg-card text-left shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            isOutOfStock
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5"
                          }`}
                        >
                          {/* Banner */}
                          <div className={`h-20 bg-gradient-to-br ${banner} flex items-center justify-center relative`}>
                            <span className={`text-4xl font-black opacity-15 select-none ${style.text}`}>
                              {product.name.slice(0, 2).toUpperCase()}
                            </span>
                            {inCart > 0 && (
                              <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow">
                                {inCart}
                              </span>
                            )}
                          </div>
                          {/* Info */}
                          <div className="p-2.5 flex flex-col gap-1">
                            <p className="text-xs font-semibold leading-tight line-clamp-2">{product.name}</p>
                            {product.sku && (
                              <p className="text-[10px] text-muted-foreground font-mono">{product.sku}</p>
                            )}
                            <div className="flex items-end justify-between mt-0.5 gap-1">
                              <span className={`text-sm font-bold ${style.text}`}>
                                ₱{fmt(parseFloat(product.price))}
                              </span>
                              <span className="text-[10px] text-muted-foreground">/{product.unit}</span>
                            </div>
                            <div className="flex items-center justify-between mt-0.5">
                              <Badge className={`text-[10px] px-1.5 py-0 border-0 ${style.bg} ${style.text}`}>
                                {CATEGORY_LABELS[product.category] ?? product.category}
                              </Badge>
                              <span
                                className={`text-[10px] font-medium ${
                                  isOutOfStock
                                    ? "text-destructive"
                                    : isLowStock
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {isOutOfStock ? "Out of stock" : `${product.quantityOnHand} left`}
                              </span>
                            </div>
                          </div>
                          {/* Hover overlay */}
                          {!isOutOfStock && (
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT PANEL: Current Order ───────────────────────── */}
            <div className="w-80 xl:w-96 flex flex-col border-l bg-background shrink-0">
              {/* Header */}
              <div className="px-5 py-3.5 border-b bg-muted/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">Current Order</h3>
                    {cart.length > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {cart.reduce((s, i) => s + i.quantity, 0)}
                      </span>
                    )}
                  </div>
                  {cart.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCart([])}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                {/* Customer */}
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue placeholder="Walk-in customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk-in">Walk-in customer</SelectItem>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} — {c.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cart items */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground py-12">
                    <ShoppingCart className="h-10 w-10 opacity-15" />
                    <p className="text-sm font-medium">Cart is empty</p>
                    <p className="text-xs text-center">Click on products in the catalog to add them here</p>
                  </div>
                ) : (
                  cart.map((item) => {
                    const product = products.find((p) => p.id === item.productId);
                    const banner = CATEGORY_BANNER[product?.category ?? "other"] ?? CATEGORY_BANNER.other;
                    const style = CATEGORY_STYLES[product?.category ?? "other"] ?? CATEGORY_STYLES.other;
                    return (
                      <div key={item.productId} className="flex items-center gap-3 py-1">
                        {/* Thumbnail */}
                        <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${banner} flex items-center justify-center shrink-0`}>
                          <span className={`text-xs font-black opacity-30 ${style.text}`}>
                            {item.productName.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium leading-tight truncate">{item.productName}</p>
                          <p className={`text-sm font-semibold ${style.text}`}>₱{fmt(item.lineTotal)}</p>
                        </div>
                        {/* Qty controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            aria-label={`Decrease ${item.productName}`}
                            onClick={() => updateQty(item.productId, -1)}
                            className="h-6 w-6 rounded-full border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label={`Increase ${item.productName}`}
                            onClick={() => updateQty(item.productId, 1)}
                            className="h-6 w-6 rounded-full border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Remove ${item.productName}`}
                            onClick={() => removeItem(item.productId)}
                            className="h-6 w-6 ml-1 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Order summary & payment */}
              <div className="border-t bg-muted/10 px-5 py-4 space-y-3">
                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="tabular-nums">₱{fmt(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-muted-foreground">
                    <span>Discount</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs">₱</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(e.target.value)}
                        className="w-24 h-7 text-right text-xs py-0 px-2 bg-background"
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="tabular-nums">₱{fmt(total)}</span>
                  </div>
                </div>

                {/* Payment method */}
                <div className="grid grid-cols-4 gap-1.5">
                  {(["cash", "gcash", "credit", "other"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        paymentMethod === m
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "border-border text-muted-foreground hover:bg-muted bg-background"
                      }`}
                    >
                      {m === "gcash" ? "GCash" : m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>

                {paymentMethod === "cash" && (
                  <div className="rounded-lg bg-muted/40 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-24 shrink-0">Amount Tendered</span>
                      <div className="flex items-center gap-1 flex-1">
                        <span className="text-xs text-muted-foreground">₱</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={amountTendered}
                          onChange={(e) => setAmountTendered(e.target.value)}
                          className="h-7 text-sm bg-background"
                        />
                      </div>
                    </div>
                    {tendered > 0 && (
                      <div className="flex justify-between text-sm font-semibold pt-1 border-t border-border/50">
                        <span className="text-muted-foreground">Change</span>
                        <span className={`tabular-nums ${change < 0 ? "text-destructive" : "text-green-600 dark:text-green-400"}`}>
                          ₱{fmt(Math.abs(change))}
                          {change < 0 && " short"}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Order notes (optional)…"
                  className="text-xs h-8 bg-background"
                />

                {/* Submit */}
                <Button
                  type="submit"
                  form="pos-form"
                  className="w-full h-11 text-sm font-semibold"
                  disabled={isPending || cart.length === 0}
                >
                  {isPending ? "Processing…" : `Complete Sale — ₱${fmt(total)}`}
                </Button>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
