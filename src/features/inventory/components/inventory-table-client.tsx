"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Search, Plus, Pencil, SlidersHorizontal } from "lucide-react";
import { CreateProductDialog } from "./create-product-dialog";
import { EditProductDialog } from "./edit-product-dialog";
import { StockAdjustSheet } from "./stock-adjust-sheet";
import type { InventoryRow } from "./inventory-table";

const CATEGORIES = [
  "all",
  "paint",
  "coating",
  "primer",
  "varnish",
  "thinner",
  "tool",
  "supply",
  "other",
] as const;

interface Props {
  initialData: InventoryRow[];
}

export function InventoryTableClient({ initialData }: Props) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<InventoryRow | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<InventoryRow | null>(null);

  const filtered = initialData.filter((row) => {
    const matchesSearch =
      row.product.name.toLowerCase().includes(search.toLowerCase()) ||
      (row.product.sku ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || row.product.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && row.product.isActive) ||
      (statusFilter === "inactive" && !row.product.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  function isLowStock(row: InventoryRow) {
    if (!row.inventory) return false;
    return row.inventory.quantityOnHand <= row.inventory.lowStockThreshold;
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="capitalize">
                  {c === "all" ? "All Categories" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Threshold</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-24 text-center text-muted-foreground"
                >
                  {search ||
                  categoryFilter !== "all" ||
                  statusFilter !== "active"
                    ? "No products match your filters."
                    : "No products in catalog yet."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => (
                <TableRow key={row.product.id}>
                  <TableCell className="font-medium">
                    {row.product.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {row.product.sku ?? "—"}
                  </TableCell>
                  <TableCell className="capitalize">
                    {row.product.category}
                  </TableCell>
                  <TableCell>{row.product.unit}</TableCell>
                  <TableCell className="text-right">
                    ₱{parseFloat(row.product.price).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.inventory ? (
                      <span
                        className={
                          isLowStock(row) ? "font-semibold text-amber-600" : ""
                        }
                      >
                        {row.inventory.quantityOnHand}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {row.inventory?.lowStockThreshold ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {row.product.isActive ? (
                        <Badge variant="secondary">Active</Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground"
                        >
                          Inactive
                        </Badge>
                      )}
                      {isLowStock(row) && (
                        <Badge variant="destructive" className="text-xs">
                          Low Stock
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setAdjustTarget(row)}
                        title="Adjust stock"
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                        <span className="sr-only">Adjust Stock</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditTarget(row)}
                        title="Edit product"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {initialData.length} products
      </p>

      <CreateProductDialog open={createOpen} onOpenChange={setCreateOpen} />

      {editTarget && (
        <EditProductDialog
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          row={editTarget}
        />
      )}

      {adjustTarget && adjustTarget.inventory && (
        <StockAdjustSheet
          open={!!adjustTarget}
          onOpenChange={(open) => !open && setAdjustTarget(null)}
          row={adjustTarget}
        />
      )}
    </>
  );
}
