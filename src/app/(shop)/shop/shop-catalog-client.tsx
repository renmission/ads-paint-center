"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { cn } from "@/shared/lib/utils";
import type { CartItem } from "@/features/orders/schemas";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  category: string;
  unit: string;
  price: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  paint: "Paint",
  coating: "Coating",
  primer: "Primer",
  varnish: "Varnish",
  thinner: "Thinner",
  tool: "Tools",
  supply: "Supplies",
  other: "Other",
};

export function ShopCatalogClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cartOpen, setCartOpen] = useState(false);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return cats.sort();
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        search.trim() === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesCat =
        selectedCategory === "all" || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, search, selectedCategory]);

  const cartTotal = cart.reduce((sum, i) => sum + i.lineTotal, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  function addToCart(product: Product) {
    const price = parseFloat(product.price);
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? {
                ...i,
                quantity: i.quantity + 1,
                lineTotal: (i.quantity + 1) * price,
              }
            : i,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: price,
          lineTotal: price,
        },
      ];
    });
  }

  function updateQty(productId: string, delta: number) {
    setCart((prev) => {
      return prev
        .map((i) => {
          if (i.productId !== productId) return i;
          const qty = i.quantity + delta;
          if (qty <= 0) return null;
          return { ...i, quantity: qty, lineTotal: qty * i.unitPrice };
        })
        .filter(Boolean) as CartItem[];
    });
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  function proceedToCheckout() {
    sessionStorage.setItem("ads_cart", JSON.stringify(cart));
    setCartOpen(false);
    router.push("/checkout");
  }

  return (
    <div>
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Products</h2>
          <p className="text-sm text-slate-500">
            {products.length} items available
          </p>
        </div>
        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col">
            <SheetHeader>
              <SheetTitle>Your Cart</SheetTitle>
            </SheetHeader>
            {cart.length === 0 ? (
              <p className="mt-8 text-center text-sm text-slate-400">
                Your cart is empty.
              </p>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto py-4">
                  <ul className="space-y-3">
                    {cart.map((item) => (
                      <li
                        key={item.productId}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">
                            {item.productName}
                          </p>
                          <p className="text-xs text-slate-500">
                            ₱{item.unitPrice.toFixed(2)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => updateQty(item.productId, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => updateQty(item.productId, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            ₱{item.lineTotal.toFixed(2)}
                          </p>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-red-500 hover:text-red-600"
                            onClick={() => removeFromCart(item.productId)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-t pt-4">
                  <div className="mb-4 flex items-center justify-between text-base font-semibold">
                    <span>Total</span>
                    <span>₱{cartTotal.toFixed(2)}</span>
                  </div>
                  <Button className="w-full" onClick={proceedToCheckout}>
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-slate-400">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => {
            const inCart = cart.find((i) => i.productId === product.id);
            return (
              <div
                key={product.id}
                className="flex flex-col rounded-xl border bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900 leading-tight">
                    {product.name}
                  </h3>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {CATEGORY_LABELS[product.category] ?? product.category}
                  </Badge>
                </div>
                {product.description && (
                  <p className="mb-3 text-xs text-slate-500 line-clamp-2">
                    {product.description}
                  </p>
                )}
                {product.sku && (
                  <p className="mb-2 text-xs text-slate-400">
                    SKU: {product.sku}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      ₱{parseFloat(product.price).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-400">per {product.unit}</p>
                  </div>
                  {inCart ? (
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => updateQty(product.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span
                        className={cn("w-8 text-center text-sm font-semibold")}
                      >
                        {inCart.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => updateQty(product.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => addToCart(product)}>
                      <Plus className="mr-1 h-3 w-3" />
                      Add
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
