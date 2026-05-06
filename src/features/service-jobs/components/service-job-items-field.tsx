"use client";

import { useState, useRef } from "react";
import { useFieldArray, useWatch, Control } from "react-hook-form";
import { Popover } from "radix-ui";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Trash2, PlusCircle, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { CreateServiceJobInput } from "../schemas";

type Product = { id: string; name: string; price: string; unit: string };

interface Props {
  control: Control<CreateServiceJobInput>;
  products: Product[];
  setValue: (
    name:
      | `items.${number}.description`
      | `items.${number}.unitPrice`
      | `items.${number}.productId`,
    value: string | number,
  ) => void;
}

interface ProductPickerProps {
  products: Product[];
  selectedId: string;
  onSelect: (product: Product | null) => void;
}

function ProductPicker({ products, selectedId, onSelect }: ProductPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = products.find((p) => p.id === selectedId);

  const filtered =
    search.trim() === ""
      ? products
      : products.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase()),
        );

  return (
    <Popover.Root
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) {
          setSearch("");
          setTimeout(() => inputRef.current?.focus(), 0);
        }
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-2 text-xs ring-offset-background",
            "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            !selected && "text-muted-foreground",
          )}
        >
          <span className="truncate">{selected ? selected.name : "— Custom item —"}</span>
          <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 w-64 rounded-md border bg-popover p-0 shadow-md"
          align="start"
          sideOffset={4}
        >
          <div className="p-2 border-b">
            <Input
              ref={inputRef}
              className="h-7 text-xs"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent",
                !selectedId && "font-medium",
              )}
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
            >
              <Check
                className={cn("h-3 w-3", selectedId ? "opacity-0" : "opacity-100")}
              />
              — Custom item —
            </button>

            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                No products found.
              </p>
            ) : (
              filtered.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent",
                    p.id === selectedId && "font-medium",
                  )}
                  onClick={() => {
                    onSelect(p);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "h-3 w-3 shrink-0",
                      p.id === selectedId ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex-1 truncate text-left">{p.name}</span>
                  <span className="text-muted-foreground">
                    ₱{parseFloat(p.price).toFixed(2)}
                  </span>
                </button>
              ))
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function fmt(n: number | string) {
  const v = parseFloat(String(n));
  return isNaN(v) ? "0.00" : v.toFixed(2);
}

export function ServiceJobItemsField({ control, products, setValue }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = useWatch({ control, name: "items" }) ?? [];

  const grandTotal = watchedItems.reduce((sum, item) => {
    const qty = Number(item?.quantity ?? 0);
    const price = Number(item?.unitPrice ?? 0);
    return sum + qty * price;
  }, 0);

  function handleProductSelect(index: number, product: Product | null) {
    if (!product) {
      setValue(`items.${index}.productId`, "");
      return;
    }
    setValue(`items.${index}.productId`, product.id);
    setValue(`items.${index}.description`, product.name);
    setValue(`items.${index}.unitPrice`, parseFloat(product.price));
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Items / Materials</p>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground py-2">
          No items added yet. Click &quot;Add Item&quot; to start.
        </p>
      )}

      {fields.map((field, index) => {
        const qty = Number(watchedItems[index]?.quantity ?? 0);
        const price = Number(watchedItems[index]?.unitPrice ?? 0);
        const lineTotal = qty * price;
        const selectedProductId = watchedItems[index]?.productId ?? "";

        return (
          <div
            key={field.id}
            className="grid grid-cols-[1fr_60px_90px_80px_32px] gap-2 items-start"
          >
            <div className="space-y-1">
              <ProductPicker
                products={products}
                selectedId={selectedProductId}
                onSelect={(p) => handleProductSelect(index, p)}
              />
              <Input
                className="h-8 text-xs"
                placeholder="Description *"
                {...control.register(`items.${index}.description`)}
              />
            </div>

            <Input
              className="h-8 text-xs"
              type="number"
              min={1}
              placeholder="Qty"
              {...control.register(`items.${index}.quantity`, {
                valueAsNumber: true,
              })}
            />

            <Input
              className="h-8 text-xs"
              type="number"
              min={0}
              step="0.01"
              placeholder="Unit ₱"
              {...control.register(`items.${index}.unitPrice`, {
                valueAsNumber: true,
              })}
            />

            <div className="h-8 flex items-center justify-end pr-1 text-xs font-medium text-muted-foreground">
              ₱{fmt(lineTotal)}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      })}

      <div className="flex items-center justify-between pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ productId: "", description: "", quantity: 1, unitPrice: 0 })
          }
        >
          <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
          Add Item
        </Button>

        <p className="text-sm font-semibold">
          Total:{" "}
          <span className="text-foreground">₱{fmt(grandTotal)}</span>
        </p>
      </div>
    </div>
  );
}
