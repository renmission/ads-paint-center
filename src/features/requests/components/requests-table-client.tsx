"use client";

import { useState, useMemo } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { ClipboardList, Search, Truck } from "lucide-react";
import type { RequestRow } from "./requests-table";
import { CreateRequestDialog } from "./create-request-dialog";
import { HandleRequestDialog } from "./handle-request-dialog";

type Customer = { id: string; name: string; phone: string };
type Product = { id: string; name: string; sku: string | null };
type StaffMember = { id: string; name: string };

interface Props {
  initialData: RequestRow[];
  customers: Customer[];
  products: Product[];
  staffList: StaffMember[];
  userRole: "administrator" | "staff";
}

const STATUS_CONFIG = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  approved: { label: "Approved", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  out_for_delivery: { label: "Out for Delivery", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  fulfilled: { label: "Fulfilled", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
} as const;

export function RequestsTableClient({ initialData, customers, products, staffList, userRole }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [handleTarget, setHandleTarget] = useState<RequestRow | null>(null);

  const filtered = useMemo(() => {
    return initialData.filter((row) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        row.requestNumber.toLowerCase().includes(q) ||
        row.customerName.toLowerCase().includes(q) ||
        (row.productName?.toLowerCase().includes(q) ?? false);
      const matchStatus = statusFilter === "all" || row.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [initialData, search, statusFilter]);

  const canHandle = (row: RequestRow) =>
    userRole === "administrator" &&
    (row.status === "pending" || row.status === "approved" || row.status === "out_for_delivery");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by request # or customer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <ClipboardList className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Handled By</TableHead>
              {userRole === "administrator" && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={userRole === "administrator" ? 9 : 8} className="h-24 text-center text-muted-foreground">
                  {initialData.length === 0
                    ? "No requests yet. Click 'New Request' to submit one."
                    : "No results match your filters."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => {
                const statusCfg = STATUS_CONFIG[row.status];
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-sm font-medium">{row.requestNumber}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(row.createdAt).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <div>{row.customerName}</div>
                      <div className="text-xs text-muted-foreground">{row.customerPhone}</div>
                    </TableCell>
                    <TableCell>
                      {row.productName ?? (
                        <span className="text-muted-foreground italic text-sm">
                          {row.productDescription ?? "—"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">{row.quantityRequested}</TableCell>
                    <TableCell>
                      {row.deliveryType === "delivery" ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-xs font-medium">
                            <Truck className="h-3 w-3" /> Delivery
                          </div>
                          {row.driverName && (
                            <div className="text-xs text-muted-foreground">{row.driverName}</div>
                          )}
                        </div>
                      ) : row.deliveryType === "pickup" ? (
                        <span className="text-xs text-muted-foreground">Pickup</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {row.handlerName ?? <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    {userRole === "administrator" && (
                      <TableCell className="text-right">
                        {canHandle(row) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setHandleTarget(row)}
                          >
                            Handle
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <CreateRequestDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        customers={customers}
        products={products}
      />
      <HandleRequestDialog
        open={!!handleTarget}
        onOpenChange={(o) => { if (!o) setHandleTarget(null); }}
        request={handleTarget}
        staffList={staffList}
      />
    </div>
  );
}
