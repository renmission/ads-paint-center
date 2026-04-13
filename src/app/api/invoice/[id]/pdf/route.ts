export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/shared/lib/db";
import { salesTransactions, salesTransactionItems, customers, users, products } from "@/shared/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/shared/lib/auth";
import { InvoicePdfDocument } from "@/features/sales/components/invoice-pdf-document";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new Response(JSON.stringify({ error: { code: "UNAUTHORIZED", message: "Authentication required." } }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { id } = await params;

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

  if (!txn) {
    return new Response(JSON.stringify({ error: { code: "NOT_FOUND", message: "Invoice not found." } }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

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

  const pdfData = {
    transactionNumber: txn.transactionNumber,
    createdAt: txn.createdAt,
    dueDate: txn.dueDate ?? null,
    paymentMethod: txn.paymentMethod,
    status: txn.status,
    subtotal: txn.subtotal,
    discountAmount: txn.discountAmount,
    totalAmount: txn.totalAmount,
    amountTendered: txn.amountTendered ?? null,
    changeAmount: txn.changeAmount ?? null,
    amountPaid: txn.amountPaid ?? null,
    notes: txn.notes ?? null,
    customerName: txn.customerName ?? null,
    customerPhone: txn.customerPhone ?? null,
    customerAddress: txn.customerAddress ?? null,
    staffName: txn.staffName,
    items: items.map((item) => ({
      productName: item.productName,
      quantity: Number(item.quantity),
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
  };

  // Call as a function to get the Document ReactElement expected by renderToBuffer
  const docElement = InvoicePdfDocument({ data: pdfData });
  const buffer = await renderToBuffer(docElement);
  const bytes = new Uint8Array(buffer);

  const filename = `invoice-${txn.transactionNumber}.pdf`;

  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(bytes.byteLength),
    },
  });
}
