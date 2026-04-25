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
  Search,
  FileText,
  AlertTriangle,
  DollarSign,
  Clock,
} from "lucide-react";
import type { ArRow, ArSummary } from "./ar-table";

interface Props {
  data: ArRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  search: string;
  overdue: string;
  summary: ArSummary;
}

function fmt(n: number | string) {
  return parseFloat(String(n)).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
  });
}

function fmtDate(d: string | Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ArTableClient({
  data,
  totalCount,
  page,
  pageSize,
  search: initialSearch,
  overdue: initialOverdue,
  summary,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [searchValue, setSearchValue] = useState(initialSearch);

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

  const hasFilters = initialSearch || initialOverdue !== "all";

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              Total Outstanding
            </p>
            <p className="text-xl font-bold tabular-nums">
              ₱{fmt(summary.totalOutstanding)}
            </p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              Overdue Invoices
            </p>
            <p className="text-xl font-bold tabular-nums">
              {summary.overdueCount}
            </p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              Open Receivables
            </p>
            <p className="text-xl font-bold tabular-nums">
              {summary.totalCount}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
          value={initialOverdue}
          onValueChange={(v) => setFilter("overdue", v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="overdue">Overdue only</SelectItem>
            <SelectItem value="current">Current only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Transaction #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Invoice Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-24 text-center text-muted-foreground"
                >
                  {!hasFilters
                    ? "No outstanding credit invoices."
                    : "No results match your filters."}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-sm font-medium">
                    {row.transactionNumber}
                  </TableCell>
                  <TableCell>
                    {row.customerName ?? (
                      <span className="text-muted-foreground italic">
                        Walk-in
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {fmtDate(row.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {row.dueDate ? (
                      <span
                        className={
                          row.isOverdue ? "text-destructive font-medium" : ""
                        }
                      >
                        {fmtDate(row.dueDate)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    ₱{fmt(row.totalAmount)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-green-600">
                    ₱{fmt(row.amountPaid)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">
                    <span
                      className={
                        row.isOverdue ? "text-destructive" : "text-amber-600"
                      }
                    >
                      ₱{fmt(row.balance)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {row.isOverdue ? (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        Overdue
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                        Outstanding
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/sales/${row.id}`}>
                        <FileText className="mr-1 h-4 w-4" />
                        Invoice
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
      />
    </div>
  );
}
