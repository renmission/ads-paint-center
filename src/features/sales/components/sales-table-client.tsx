"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
import { TablePagination } from "@/shared/components/ui/table-pagination";
import {
  ShoppingCart,
  XCircle,
  Search,
  TrendingUp,
  Receipt,
  BarChart3,
  FileText,
} from "lucide-react";
import type { SalesRow, DailyStats } from "./sales-table";
import { VoidSaleDialog } from "./void-sale-dialog";
import { AddPaymentDialog } from "./add-payment-dialog";

interface Props {
  data: SalesRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  search: string;
  status: string;
  method: string;
  userRole: "administrator" | "staff";
  dailyStats: DailyStats;
}

const STATUS_LABELS = {
  completed: {
    label: "Completed",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  voided: {
    label: "Voided",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
  pending: {
    label: "Pending",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
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

export function SalesTableClient({
  data,
  totalCount,
  page,
  pageSize,
  search: initialSearch,
  status: initialStatus,
  method: initialMethod,
  userRole,
  dailyStats,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [searchValue, setSearchValue] = useState(initialSearch);
  const [voidTarget, setVoidTarget] = useState<SalesRow | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<SalesRow | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (searchValue) next.set("search", searchValue);
      else next.delete("search");
      next.set("page", "1");
      router.replace(`${pathname}?${next.toString()}`);
    }, 300);
    return () => clearTimeout(t);
  }, [searchValue]); // eslint-disable-line react-hooks/exhaustive-deps

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "all") next.delete(key);
    else next.set(key, value);
    next.set("page", "1");
    router.replace(`${pathname}?${next.toString()}`);
  }

  const hasFilters =
    initialSearch || initialStatus !== "all" || initialMethod !== "all";

  return (
    <div className="space-y-5">
      {/* Daily stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              Today&apos;s Revenue
            </p>
            <p className="text-xl font-bold tabular-nums">
              ₱{fmt(dailyStats.revenue)}
            </p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <Receipt className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              Transactions Today
            </p>
            <p className="text-xl font-bold tabular-nums">
              {dailyStats.transactionCount}
            </p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
            <BarChart3 className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              Average Sale
            </p>
            <p className="text-xl font-bold tabular-nums">
              ₱{fmt(dailyStats.averageSale)}
            </p>
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
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={initialStatus}
            onValueChange={(v) => setFilter("status", v)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending Payment</SelectItem>
              <SelectItem value="voided">Voided</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={initialMethod}
            onValueChange={(v) => setFilter("method", v)}
          >
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
              {userRole === "administrator" && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={userRole === "administrator" ? 9 : 8}
                  className="h-24 text-center text-muted-foreground"
                >
                  {!hasFilters
                    ? "No sales yet. Click 'New Sale' to start."
                    : "No results match your filters."}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const status =
                  STATUS_LABELS[row.status] ?? STATUS_LABELS.completed;
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {row.transactionNumber}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(row.createdAt).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      {row.customerName ?? (
                        <span className="text-muted-foreground italic">
                          Walk-in
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{row.staffName}</TableCell>
                    <TableCell className="text-center">
                      {row.itemCount}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      <div>
                        ₱
                        {parseFloat(row.totalAmount).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                      {row.paymentMethod === "credit" &&
                        row.amountPaid !== null &&
                        (() => {
                          const balance =
                            parseFloat(row.totalAmount) -
                            parseFloat(row.amountPaid);
                          return balance > 0 ? (
                            <div className="text-xs text-amber-600 font-medium tabular-nums">
                              ₱
                              {balance.toLocaleString("en-PH", {
                                minimumFractionDigits: 2,
                              })}{" "}
                              due
                            </div>
                          ) : null;
                        })()}
                    </TableCell>
                    <TableCell>
                      {METHOD_LABELS[row.paymentMethod] ?? row.paymentMethod}
                    </TableCell>
                    <TableCell>
                      <Badge className={status.className}>{status.label}</Badge>
                    </TableCell>
                    {userRole === "administrator" && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/sales/${row.id}`}>
                              <FileText className="mr-1 h-4 w-4" />
                              Invoice
                            </Link>
                          </Button>
                          {row.status === "pending" &&
                            row.paymentMethod !== "credit" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-amber-600 hover:text-amber-600"
                                onClick={() => setPaymentTarget(row)}
                              >
                                Add Payment
                              </Button>
                            )}
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
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
      />

      <VoidSaleDialog
        open={!!voidTarget}
        onOpenChange={(o) => {
          if (!o) setVoidTarget(null);
        }}
        transaction={voidTarget}
      />
      <AddPaymentDialog
        open={!!paymentTarget}
        onOpenChange={(o) => {
          if (!o) setPaymentTarget(null);
        }}
        transaction={paymentTarget}
      />
    </div>
  );
}
