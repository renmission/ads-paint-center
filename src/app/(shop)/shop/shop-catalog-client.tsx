"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Plus,
  Minus,
  ArrowRight,
  X,
  ShoppingBag,
} from "lucide-react";
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
  imageUrl: string | null;
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

const CATEGORY_COLORS: Record<string, string> = {
  paint: "bg-orange-100 text-orange-700 border-orange-200",
  coating: "bg-blue-100 text-blue-700 border-blue-200",
  primer: "bg-green-100 text-green-700 border-green-200",
  varnish: "bg-yellow-100 text-yellow-700 border-yellow-200",
  thinner: "bg-stone-100 text-stone-600 border-stone-200",
  tool: "bg-red-100 text-red-700 border-red-200",
  supply: "bg-purple-100 text-purple-700 border-purple-200",
  other: "bg-slate-100 text-slate-600 border-slate-200",
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
            <Button
              variant="default"
              className="relative bg-orange-500 hover:bg-orange-600 text-white"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white border-2 border-orange-500 text-[10px] font-bold text-orange-600 shadow-sm">
                  {cartCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col gap-0 bg-white border-l border-slate-200 p-0">
            {/* Hidden accessible title for screen readers */}
            <SheetHeader className="sr-only">
              <SheetTitle>Your Cart</SheetTitle>
            </SheetHeader>

            {/* Visual header */}
            <div className="flex items-center px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Your Cart
              </h2>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16">
                <ShoppingBag
                  className="h-14 w-14 text-slate-300"
                  strokeWidth={1.25}
                />
                <p className="text-base font-medium text-slate-400">
                  No items yet
                </p>
                <p className="text-xs text-slate-400 text-center">
                  Add products from the catalog to get started.
                </p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  <ul className="space-y-3">
                    {cart.map((item) => (
                      <li
                        key={item.productId}
                        className="flex items-stretch gap-0 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden"
                      >
                        {/* Orange accent stripe */}
                        <div className="w-1 shrink-0 bg-orange-500 rounded-full my-3 ml-3" />

                        {/* Item content */}
                        <div className="flex flex-1 min-w-0 flex-col justify-center py-3 px-3 gap-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-sm font-medium text-slate-800 leading-snug">
                              {item.productName}
                            </p>
                            <button
                              type="button"
                              className="shrink-0 text-slate-400 hover:text-red-500 transition-colors mt-0.5 cursor-pointer"
                              onClick={() => removeFromCart(item.productId)}
                              aria-label="Remove item"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <p className="text-xs text-slate-400">
                            ₱{item.unitPrice.toFixed(2)} / unit
                          </p>

                          <div className="flex items-center justify-between">
                            {/* Qty pill */}
                            <div className="flex items-center gap-1 rounded-full bg-white border border-slate-200 px-1 py-0.5">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                onClick={() => updateQty(item.productId, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-sm font-semibold text-slate-800">
                                {item.quantity}
                              </span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                onClick={() => updateQty(item.productId, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Line total */}
                            <p className="text-sm font-bold text-orange-600">
                              ₱{item.lineTotal.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer / total */}
                <div className="border-t border-slate-100 px-5 py-4 space-y-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-slate-500 font-medium">
                      Order Total
                    </span>
                    <span className="text-2xl font-bold text-slate-900">
                      ₱{cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-11 text-base"
                    onClick={proceedToCheckout}
                  >
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
            className={cn(
              "rounded-full",
              selectedCategory === "all"
                ? "bg-orange-500 hover:bg-orange-600 text-white border-transparent"
                : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50",
            )}
            onClick={() => setSelectedCategory("all")}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={selectedCategory === cat ? "default" : "outline"}
              className={cn(
                "rounded-full",
                selectedCategory === cat
                  ? "bg-orange-500 hover:bg-orange-600 text-white border-transparent"
                  : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50",
              )}
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
                className="flex flex-col rounded-xl border bg-white shadow-sm overflow-hidden"
              >
                {product.imageUrl && (
                  <div className="relative h-40 w-full bg-slate-100">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div className="flex flex-col flex-1 p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900 leading-tight">
                      {product.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 text-xs border",
                        CATEGORY_COLORS[product.category] ??
                          "bg-slate-100 text-slate-600 border-slate-200",
                      )}
                    >
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
                      <p className="text-xs text-slate-400">
                        per {product.unit}
                      </p>
                    </div>
                    {inCart ? (
                      <div className="flex items-center gap-1 rounded-lg bg-orange-50 border border-orange-200 px-1 py-0.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-orange-600 hover:bg-orange-100"
                          onClick={() => updateQty(product.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-semibold text-orange-700">
                          {inCart.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-orange-600 hover:bg-orange-100"
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
