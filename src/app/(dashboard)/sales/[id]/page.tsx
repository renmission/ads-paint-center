import { notFound } from "next/navigation";
import { db } from "@/shared/lib/db";
import { salesTransactions, salesTransactionItems, customers, users, products } from "@/shared/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/shared/lib/auth";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { InvoicePrintButton } from "./invoice-print-button";
import { MarkCreditPaymentDialog } from "./mark-credit-payment-dialog";

function fmt(n: number | string) {
  return parseFloat(String(n)).toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

function fmtDate(d: string | Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const txn = await db
    .select({
      id: salesTransactions.id,
      transactionNumber: salesTransactions.transactionNumber,
      createdAt: salesTransactions.createdAt,
      subtotal: salesTransactions.subtotal,
      discountAmount: salesTransactions.discountAmount,
      totalAmount: salesTransactions.totalAmount,
      amountTendered: salesTransactions.amountTendered,
      changeAmount: salesTransactions.changeAmount,
      amountPaid: salesTransactions.amountPaid,
      dueDate: salesTransactions.dueDate,
      paymentMethod: salesTransactions.paymentMethod,
      status: salesTransactions.status,
      notes: salesTransactions.notes,
      customerName: customers.name,
      customerPhone: customers.phone,
      customerAddress: customers.address,
      staffName: users.name,
    })
    .from(salesTransactions)
    .leftJoin(customers, eq(salesTransactions.customerId, customers.id))
    .innerJoin(users, eq(salesTransactions.staffId, users.id))
    .where(eq(salesTransactions.id, id))
    .limit(1)
    .then((r) => r[0] ?? null);

  if (!txn) notFound();

  const items = await db
    .select({
      productName: products.name,
      quantity: salesTransactionItems.quantity,
      unitPrice: salesTransactionItems.unitPrice,
      lineTotal: salesTransactionItems.lineTotal,
    })
    .from(salesTransactionItems)
    .innerJoin(products, eq(salesTransactionItems.productId, products.id))
    .where(eq(salesTransactionItems.transactionId, id));

  const total = parseFloat(txn.totalAmount);
  const paid = parseFloat(txn.amountPaid ?? txn.totalAmount);
  const balance = Math.max(0, total - paid);
  const isCredit = txn.paymentMethod === "credit";
  const isOverdue = txn.dueDate ? new Date(txn.dueDate) < new Date() && balance > 0 : false;

  const METHOD_LABELS: Record<string, string> = {
    cash: "Cash",
    gcash: "GCash",
    credit: "Credit",
    other: "Other",
  };

  return (
    <>
      {/* Print isolation CSS — hides everything except invoice when printing */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print-area, #invoice-print-area * { visibility: visible; }
          #invoice-print-area { position: fixed; inset: 0; padding: 2rem; background: white; z-index: 9999; }
        }
      `}</style>

      <div className="max-w-3xl mx-auto space-y-4">
        {/* Back + actions */}
        <div className="flex items-center justify-between print:hidden">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sales">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to Sales
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            {isCredit && balance > 0 && session?.user?.role === "administrator" && (
              <MarkCreditPaymentDialog transactionId={txn.id} balance={balance} />
            )}
            <InvoicePrintButton id={txn.id} transactionNumber={txn.transactionNumber} />
          </div>
        </div>

        {/* Invoice card */}
        <div id="invoice-print-area" className="rounded-xl border bg-card shadow-sm p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">ADS Paint Center</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Paint & Coatings Specialist</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold font-mono">{txn.transactionNumber}</p>
              <p className="text-xs text-muted-foreground">
                {txn.status === "voided" ? (
                  <span className="text-destructive font-semibold">VOIDED</span>
                ) : isCredit ? (
                  balance > 0 ? (
                    <span className={isOverdue ? "text-destructive font-semibold" : "text-amber-600 font-semibold"}>
                      {isOverdue ? "OVERDUE" : "UNPAID"}
                    </span>
                  ) : (
                    <span className="text-green-600 font-semibold">PAID</span>
                  )
                ) : (
                  <span className="text-green-600 font-semibold">PAID</span>
                )}
              </p>
            </div>
          </div>

          <Separator />

          {/* Invoice meta */}
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bill To</p>
              {txn.customerName ? (
                <>
                  <p className="font-semibold">{txn.customerName}</p>
                  {txn.customerPhone && <p className="text-muted-foreground">{txn.customerPhone}</p>}
                  {txn.customerAddress && <p className="text-muted-foreground text-xs">{txn.customerAddress}</p>}
                </>
              ) : (
                <p className="text-muted-foreground italic">Walk-in Customer</p>
              )}
            </div>
            <div className="space-y-1 text-right">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Invoice Details</p>
              <div className="space-y-0.5">
                <div className="flex justify-end gap-8">
                  <span className="text-muted-foreground">Date</span>
                  <span>{fmtDate(txn.createdAt)}</span>
                </div>
                {isCredit && txn.dueDate && (
                  <div className="flex justify-end gap-8">
                    <span className={isOverdue ? "text-destructive" : "text-muted-foreground"}>Due Date</span>
                    <span className={isOverdue ? "text-destructive font-semibold" : ""}>{fmtDate(txn.dueDate)}</span>
                  </div>
                )}
                <div className="flex justify-end gap-8">
                  <span className="text-muted-foreground">Served By</span>
                  <span>{txn.staffName}</span>
                </div>
                <div className="flex justify-end gap-8">
                  <span className="text-muted-foreground">Payment</span>
                  <span>{METHOD_LABELS[txn.paymentMethod] ?? txn.paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Line items */}
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="text-left pb-2 font-medium">Product</th>
                  <th className="text-center pb-2 font-medium w-16">Qty</th>
                  <th className="text-right pb-2 font-medium w-28">Unit Price</th>
                  <th className="text-right pb-2 font-medium w-28">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2.5">{item.productName}</td>
                    <td className="py-2.5 text-center tabular-nums">{item.quantity}</td>
                    <td className="py-2.5 text-right tabular-nums">₱{fmt(item.unitPrice)}</td>
                    <td className="py-2.5 text-right tabular-nums font-medium">₱{fmt(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Separator />

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">₱{fmt(txn.subtotal)}</span>
              </div>
              {parseFloat(txn.discountAmount) > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount</span>
                  <span className="tabular-nums text-green-600">−₱{fmt(txn.discountAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="tabular-nums">₱{fmt(txn.totalAmount)}</span>
              </div>
              {isCredit && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="tabular-nums text-green-600">₱{fmt(paid)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-sm">
                    <span className={balance > 0 ? (isOverdue ? "text-destructive" : "text-amber-600") : "text-green-600"}>
                      Balance Due
                    </span>
                    <span className={`tabular-nums ${balance > 0 ? (isOverdue ? "text-destructive" : "text-amber-600") : "text-green-600"}`}>
                      ₱{fmt(balance)}
                    </span>
                  </div>
                </>
              )}
              {txn.paymentMethod === "cash" && txn.amountTendered && (
                <>
                  <div className="flex justify-between text-muted-foreground text-xs">
                    <span>Tendered</span>
                    <span className="tabular-nums">₱{fmt(txn.amountTendered)}</span>
                  </div>
                  {txn.changeAmount && (
                    <div className="flex justify-between text-muted-foreground text-xs">
                      <span>Change</span>
                      <span className="tabular-nums">₱{fmt(txn.changeAmount)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Overdue warning */}
          {isOverdue && balance > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 text-destructive p-3 text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>This invoice is overdue. Please settle the outstanding balance of ₱{fmt(balance)}.</span>
            </div>
          )}

          {txn.notes && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Notes: </span>{txn.notes}
            </div>
          )}

          {/* Footer */}
          <Separator />
          <p className="text-center text-xs text-muted-foreground">
            Thank you for your business! — ADS Paint Center
          </p>
        </div>
      </div>
    </>
  );
}
