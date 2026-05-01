"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ShoppingCart,
  Plus,
  Minus,
  ArrowRight,
  X,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
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

const CATEGORY_PRICE_COLOR: Record<string, string> = {
  paint: "text-orange-600",
  coating: "text-blue-600",
  primer: "text-green-600",
  varnish: "text-yellow-600",
  thinner: "text-stone-600",
  tool: "text-red-600",
  supply: "text-purple-600",
  other: "text-slate-700",
};

const CATEGORY_BANNER: Record<string, string> = {
  paint: "from-orange-50 to-orange-100",
  coating: "from-blue-50 to-blue-100",
  primer: "from-green-50 to-green-100",
  varnish: "from-yellow-50 to-yellow-100",
  thinner: "from-stone-50 to-stone-100",
  tool: "from-red-50 to-red-100",
  supply: "from-purple-50 to-purple-100",
  other: "from-slate-50 to-slate-100",
};

export function ShopCatalogClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const { data: session } = useSession();
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
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.productId !== productId) return i;
          const qty = i.quantity + delta;
          if (qty <= 0) return null;
          return { ...i, quantity: qty, lineTotal: qty * i.unitPrice };
        })
        .filter(Boolean) as CartItem[],
    );
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  function proceedToCheckout() {
    sessionStorage.setItem("ads_cart", JSON.stringify(cart));
    setCartOpen(false);
    if (!session?.user) {
      router.push("/shop/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
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
            <SheetHeader className="sr-only">
              <SheetTitle>Your Cart</SheetTitle>
            </SheetHeader>

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
                        <div className="w-1 shrink-0 bg-orange-500 rounded-full my-3 ml-3" />
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
                            <p className="text-sm font-bold text-orange-600">
                              ₱{item.lineTotal.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

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
                    {session?.user ? "Proceed to Checkout" : "Sign In to Checkout"}
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

      {/* Product grid — POS-style tiles */}
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-slate-400">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => {
            const inCart = cart.find((i) => i.productId === product.id);
            return (
              <div
                key={product.id}
                className={cn(
                  "group relative flex flex-col rounded-xl overflow-hidden border bg-white text-left shadow-sm",
                  "transition-all hover:shadow-md hover:border-orange-200",
                  inCart && "border-orange-200",
                )}
              >
                {/* Image zone — square aspect ratio */}
                <div className="relative aspect-square w-full bg-slate-100">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div
                      className={cn(
                        "absolute inset-0 flex items-center justify-center bg-gradient-to-br",
                        CATEGORY_BANNER[product.category] ??
                          "from-slate-50 to-slate-100",
                      )}
                    >
                      <span className="text-4xl font-black opacity-20 text-slate-700 select-none">
                        {product.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Category badge — top-left overlay */}
                  <span
                    className={cn(
                      "absolute top-2 left-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border backdrop-blur-sm",
                      CATEGORY_COLORS[product.category] ??
                        "bg-slate-100 text-slate-600 border-slate-200",
                    )}
                  >
                    {CATEGORY_LABELS[product.category] ?? product.category}
                  </span>

                  {/* In-cart qty badge — top-right overlay */}
                  {inCart && (
                    <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow">
                      {inCart.quantity}
                    </span>
                  )}
                </div>

                {/* Info zone */}
                <div className="flex flex-col flex-1 px-2.5 pt-2 pb-1 gap-1">
                  <p className="text-xs font-semibold text-slate-900 leading-tight line-clamp-2">
                    {product.name}
                  </p>
                  <div className="flex items-baseline justify-between gap-1 mt-auto pb-1">
                    <span
                      className={cn(
                        "text-sm font-bold",
                        CATEGORY_PRICE_COLOR[product.category] ?? "text-slate-900",
                      )}
                    >
                      ₱{parseFloat(product.price).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      /{product.unit}
                    </span>
                  </div>
                </div>

                {/* Bottom strip — add or qty controls */}
                {inCart ? (
                  <div
                    className="flex items-center justify-between border-t border-orange-100 bg-orange-50 px-2 py-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded-full text-orange-600 hover:bg-orange-100 transition-colors"
                      onClick={() => updateQty(product.id, -1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-bold text-orange-700">
                      {inCart.quantity}
                    </span>
                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded-full text-orange-600 hover:bg-orange-100 transition-colors"
                      onClick={() => updateQty(product.id, 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className="border-t border-slate-100 bg-slate-50 px-2 py-1.5 flex justify-center hover:bg-orange-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <span className="text-xs text-slate-400 font-medium group-hover:text-orange-600 transition-colors">
                      + Add
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
