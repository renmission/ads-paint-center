"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Image from "next/image";
import { ImageIcon, X } from "lucide-react";
import { updateProductSchema, type UpdateProductInput } from "../schemas";
import { updateProductAction, toggleProductActiveAction } from "../actions";
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
import type { InventoryRow } from "./inventory-table";

const CATEGORIES = [
  "paint",
  "coating",
  "primer",
  "varnish",
  "thinner",
  "tool",
  "supply",
  "other",
] as const;

type UnitOption = {
  id: string;
  name: string;
  abbreviation: string;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: InventoryRow;
  units: UnitOption[];
}

export function EditProductDialog({ open, onOpenChange, row, units }: Props) {
  const { product } = row;

  const [state, formAction, isPending] = useActionState(
    updateProductAction,
    undefined,
  );

  const [toggleState, toggleAction, isTogglePending] = useActionState(
    toggleProductActiveAction,
    undefined,
  );

  const [imageUrl, setImageUrl] = useState<string | null>(
    product.imageUrl ?? null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UpdateProductInput>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      id: product.id,
      name: product.name,
      sku: product.sku ?? "",
      description: product.description ?? "",
      imageUrl: product.imageUrl ?? undefined,
      category: product.category as UpdateProductInput["category"],
      unit: product.unit,
      price: product.price,
      lowStockThreshold: String(row.inventory?.lowStockThreshold ?? 10),
    },
  });

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      onOpenChange(false);
    }
    if (state?.error) toast.error(state.error);
  }, [state]);

  useEffect(() => {
    if (toggleState?.success) {
      toast.success(toggleState.success);
      onOpenChange(false);
    }
    if (toggleState?.error) toast.error(toggleState.error);
  }, [toggleState]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/inventory/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Upload failed.");
        return;
      }
      setImageUrl(json.url);
      form.setValue("imageUrl", json.url);
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage() {
    setImageUrl(null);
    form.setValue("imageUrl", null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="id" value={product.id} />
            {imageUrl !== null && (
              <input type="hidden" name="imageUrl" value={imageUrl} />
            )}

            {/* Image upload */}
            <FormItem>
              <FormLabel>Product Image (optional)</FormLabel>
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
                  {imageUrl ? (
                    <>
                      <Image
                        src={imageUrl}
                        alt="Product preview"
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground shadow"
                        aria-label="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading
                    ? "Uploading..."
                    : imageUrl
                      ? "Replace"
                      : "Upload Image"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  aria-label="Upload product image"
                  onChange={handleFileChange}
                />
              </div>
            </FormItem>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      name="category"
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c} className="capitalize">
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select
                      name="unit"
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units.map((u) => (
                          <SelectItem key={u.id} value={u.name}>
                            {u.name} ({u.abbreviation})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₱)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <form action={toggleAction} className="mr-auto">
                <input type="hidden" name="id" value={product.id} />
                <input
                  type="hidden"
                  name="isActive"
                  value={String(product.isActive)}
                />
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isTogglePending}
                  className={
                    product.isActive
                      ? "text-destructive hover:text-destructive"
                      : ""
                  }
                >
                  {isTogglePending
                    ? "..."
                    : product.isActive
                      ? "Archive"
                      : "Restore"}
                </Button>
              </form>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || isUploading}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
