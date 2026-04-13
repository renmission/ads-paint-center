import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 40,
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  companyName: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  companyTagline: { fontSize: 9, color: "#6b7280", marginTop: 2 },
  txnNumber: { fontSize: 13, fontFamily: "Helvetica-Bold", textAlign: "right" },
  statusBadge: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    marginTop: 3,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginVertical: 14,
  },
  metaSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#9ca3af",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  metaValue: { fontSize: 10 },
  metaValueBold: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  metaRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 32,
    marginBottom: 2,
  },
  metaKey: { color: "#6b7280" },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 5,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  colProduct: { flex: 1 },
  colQty: { width: 40, textAlign: "center" },
  colPrice: { width: 72, textAlign: "right" },
  colTotal: { width: 72, textAlign: "right" },
  thText: {
    fontSize: 8,
    color: "#9ca3af",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  totalsSection: { alignItems: "flex-end", marginTop: 8 },
  totalsBox: { width: 200 },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  totalsLabel: { color: "#6b7280" },
  totalsBold: { fontFamily: "Helvetica-Bold", fontSize: 12 },
  balanceLabel: { fontFamily: "Helvetica-Bold" },
  footer: { marginTop: 24, textAlign: "center", fontSize: 9, color: "#9ca3af" },
  overdueBox: {
    marginTop: 12,
    backgroundColor: "#fef2f2",
    borderRadius: 4,
    padding: 8,
    flexDirection: "row",
  },
  overdueText: { color: "#dc2626", fontSize: 9 },
  notesText: { fontSize: 9, color: "#6b7280", marginTop: 8 },
});

export type InvoicePdfData = {
  transactionNumber: string;
  createdAt: Date;
  dueDate: string | null;
  paymentMethod: string;
  status: "pending" | "completed" | "voided";
  subtotal: string;
  discountAmount: string;
  totalAmount: string;
  amountPaid: string | null;
  amountTendered: string | null;
  changeAmount: string | null;
  notes: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  staffName: string;
  items: {
    productName: string;
    quantity: number;
    unitPrice: string;
    lineTotal: string;
  }[];
};

function fmt(n: number | string) {
  return parseFloat(String(n)).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
  });
}

function fmtDate(d: string | Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  gcash: "GCash",
  credit: "Credit",
  other: "Other",
};

export function InvoicePdfDocument({ data }: { data: InvoicePdfData }) {
  const total = parseFloat(data.totalAmount);
  const paid = parseFloat(data.amountPaid ?? data.totalAmount);
  const balance = Math.max(0, total - paid);
  const isCredit = data.paymentMethod === "credit";
  const isOverdue = data.dueDate
    ? new Date(data.dueDate) < new Date() && balance > 0
    : false;

  let statusLabel = "PAID";
  let statusColor = "#16a34a";
  if (data.status === "voided") {
    statusLabel = "VOIDED";
    statusColor = "#dc2626";
  } else if (isCredit && balance > 0) {
    statusLabel = isOverdue ? "OVERDUE" : "UNPAID";
    statusColor = isOverdue ? "#dc2626" : "#d97706";
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>ADS Paint Center</Text>
            <Text style={styles.companyTagline}>
              Paint &amp; Coatings Specialist
            </Text>
          </View>
          <View>
            <Text style={styles.txnNumber}>{data.transactionNumber}</Text>
            <Text style={[styles.statusBadge, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Bill To + Invoice Details */}
        <View style={styles.metaSection}>
          <View>
            <Text style={styles.metaLabel}>Bill To</Text>
            {data.customerName ? (
              <>
                <Text style={styles.metaValueBold}>{data.customerName}</Text>
                {data.customerPhone ? (
                  <Text style={[styles.metaValue, { color: "#6b7280" }]}>
                    {data.customerPhone}
                  </Text>
                ) : null}
                {data.customerAddress ? (
                  <Text
                    style={[
                      styles.metaValue,
                      { color: "#6b7280", fontSize: 9 },
                    ]}
                  >
                    {data.customerAddress}
                  </Text>
                ) : null}
              </>
            ) : (
              <Text style={[styles.metaValue, { color: "#9ca3af" }]}>
                Walk-in Customer
              </Text>
            )}
          </View>
          <View>
            <Text style={[styles.metaLabel, { textAlign: "right" }]}>
              Invoice Details
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Date</Text>
              <Text>{fmtDate(data.createdAt)}</Text>
            </View>
            {isCredit && data.dueDate ? (
              <View style={styles.metaRow}>
                <Text style={isOverdue ? { color: "#dc2626" } : styles.metaKey}>
                  Due Date
                </Text>
                <Text
                  style={
                    isOverdue
                      ? { color: "#dc2626", fontFamily: "Helvetica-Bold" }
                      : {}
                  }
                >
                  {fmtDate(data.dueDate)}
                </Text>
              </View>
            ) : null}
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Served By</Text>
              <Text>{data.staffName}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Payment</Text>
              <Text>
                {METHOD_LABELS[data.paymentMethod] ?? data.paymentMethod}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Line Items */}
        <View style={styles.tableHeader}>
          <Text style={[styles.thText, styles.colProduct]}>Product</Text>
          <Text style={[styles.thText, styles.colQty]}>Qty</Text>
          <Text style={[styles.thText, styles.colPrice]}>Unit Price</Text>
          <Text style={[styles.thText, styles.colTotal]}>Total</Text>
        </View>
        {data.items.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.colProduct}>{item.productName}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>₱{fmt(item.unitPrice)}</Text>
            <Text style={[styles.colTotal, { fontFamily: "Helvetica-Bold" }]}>
              ₱{fmt(item.lineTotal)}
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text>₱{fmt(data.subtotal)}</Text>
            </View>
            {parseFloat(data.discountAmount) > 0 ? (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Discount</Text>
                <Text style={{ color: "#16a34a" }}>
                  −₱{fmt(data.discountAmount)}
                </Text>
              </View>
            ) : null}
            <View
              style={[
                styles.totalsRow,
                {
                  borderTopWidth: 1,
                  borderTopColor: "#e5e7eb",
                  paddingTop: 5,
                  marginTop: 3,
                },
              ]}
            >
              <Text style={styles.totalsBold}>Total</Text>
              <Text style={styles.totalsBold}>₱{fmt(data.totalAmount)}</Text>
            </View>
            {isCredit ? (
              <>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Amount Paid</Text>
                  <Text style={{ color: "#16a34a" }}>₱{fmt(paid)}</Text>
                </View>
                <View style={styles.totalsRow}>
                  <Text
                    style={[
                      styles.balanceLabel,
                      {
                        color:
                          balance > 0
                            ? isOverdue
                              ? "#dc2626"
                              : "#d97706"
                            : "#16a34a",
                      },
                    ]}
                  >
                    Balance Due
                  </Text>
                  <Text
                    style={[
                      styles.balanceLabel,
                      {
                        color:
                          balance > 0
                            ? isOverdue
                              ? "#dc2626"
                              : "#d97706"
                            : "#16a34a",
                      },
                    ]}
                  >
                    ₱{fmt(balance)}
                  </Text>
                </View>
              </>
            ) : null}
            {data.paymentMethod === "cash" && data.amountTendered ? (
              <>
                <View style={styles.totalsRow}>
                  <Text style={[styles.totalsLabel, { fontSize: 9 }]}>
                    Tendered
                  </Text>
                  <Text style={{ fontSize: 9 }}>
                    ₱{fmt(data.amountTendered)}
                  </Text>
                </View>
                {data.changeAmount ? (
                  <View style={styles.totalsRow}>
                    <Text style={[styles.totalsLabel, { fontSize: 9 }]}>
                      Change
                    </Text>
                    <Text style={{ fontSize: 9 }}>
                      ₱{fmt(data.changeAmount)}
                    </Text>
                  </View>
                ) : null}
              </>
            ) : null}
          </View>
        </View>

        {/* Overdue warning */}
        {isOverdue && balance > 0 ? (
          <View style={styles.overdueBox}>
            <Text style={styles.overdueText}>
              This invoice is overdue. Please settle the outstanding balance of
              ₱{fmt(balance)}.
            </Text>
          </View>
        ) : null}

        {data.notes ? (
          <Text style={styles.notesText}>Notes: {data.notes}</Text>
        ) : null}

        {/* Footer */}
        <View style={styles.divider} />
        <Text style={styles.footer}>
          Thank you for your business! — ADS Paint Center
        </Text>
      </Page>
    </Document>
  );
}
