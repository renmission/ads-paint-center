"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
import { ShoppingCart, XCircle, Search, TrendingUp, Receipt, BarChart3 } from "lucide-react";
import type { SalesRow, DailyStats } from "./sales-table";
import { VoidSaleDialog } from "./void-sale-dialog";

interface Props {
  initialData: SalesRow[];
  userRole: "administrator" | "staff";
  dailyStats: DailyStats;
}

const STATUS_LABELS = {
  completed: { label: "Completed", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  voided: { label: "Voided", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
} as const;

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  gcash: "GCash",
  credit: "Credit",
  other: "Other",
};

function fmt(n: number) {
  return n.toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

export function SalesTableClient({ initialData, userRole, dailyStats }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [voidTarget, setVoidTarget] = useState<SalesRow | null>(null);

  const filtered = useMemo(() => {
    return initialData.filter((row) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        row.transactionNumber.toLowerCase().includes(q) ||
        (row.customerName?.toLowerCase().includes(q) ?? false) ||
        row.staffName.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || row.status === statusFilter;
      const matchMethod = methodFilter === "all" || row.paymentMethod === methodFilter;
      return matchSearch && matchStatus && matchMethod;
    });
  }, [initialData, search, statusFilter, methodFilter]);

  return (
    <div className="space-y-5">
      {/* Daily stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Today&apos;s Revenue</p>
            <p className="text-xl font-bold tabular-nums">₱{fmt(dailyStats.revenue)}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <Receipt className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Transactions Today</p>
            <p className="text-xl font-bold tabular-nums">{dailyStats.transactionCount}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
            <BarChart3 className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Average Sale</p>
            <p className="text-xl font-bold tabular-nums">₱{fmt(dailyStats.averageSale)}</p>
          </div>
        </div>
      </div>

      {/* Filters + New Sale */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by transaction # or customer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="voided">Voided</SelectItem>
            </SelectContent>
          </Select>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All methods</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="gcash">GCash</SelectItem>
              <SelectItem value="credit">Credit</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button asChild>
          <Link href="/pos">
            <ShoppingCart className="mr-2 h-4 w-4" />
            New Sale
          </Link>
        </Button>
      </div>

      {/* Transaction history table */}
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Transaction #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead className="text-center">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              {userRole === "administrator" && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={userRole === "administrator" ? 9 : 8} className="h-24 text-center text-muted-foreground">
                  {initialData.length === 0 ? "No sales yet. Click 'New Sale' to start." : "No results match your filters."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => {
                const status = STATUS_LABELS[row.status] ?? STATUS_LABELS.completed;
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-sm font-medium">{row.transactionNumber}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(row.createdAt).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>{row.customerName ?? <span className="text-muted-foreground italic">Walk-in</span>}</TableCell>
                    <TableCell>{row.staffName}</TableCell>
                    <TableCell className="text-center">{row.itemCount}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      ₱{parseFloat(row.totalAmount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{METHOD_LABELS[row.paymentMethod] ?? row.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge className={status.className}>{status.label}</Badge>
                    </TableCell>
                    {userRole === "administrator" && (
                      <TableCell className="text-right">
                        {row.status === "completed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setVoidTarget(row)}
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Void
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

      <VoidSaleDialog
        open={!!voidTarget}
        onOpenChange={(o) => { if (!o) setVoidTarget(null); }}
        transaction={voidTarget}
      />
    </div>
  );
}
