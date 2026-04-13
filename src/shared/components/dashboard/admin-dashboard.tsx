import { db } from "@/shared/lib/db";
import {
  products,
  inventory,
  salesTransactions,
  requests,
} from "@/shared/lib/db/schema";
import { eq, lte, sql, and, gte } from "drizzle-orm";
import { StatCard } from "./stat-card";
import {
  Package,
  AlertTriangle,
  DollarSign,
  ClipboardList,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

async function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalProducts, lowStockCount, todaySales, pendingRequests] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(eq(products.isActive, true)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(inventory)
        .where(lte(inventory.quantityOnHand, inventory.lowStockThreshold)),
      db
        .select({ total: sql<string>`coalesce(sum(total_amount), 0)` })
        .from(salesTransactions)
        .where(
          and(
            eq(salesTransactions.status, "completed"),
            gte(salesTransactions.createdAt, today),
          ),
        ),
      db
        .select({ count: sql<number>`count(*)` })
        .from(requests)
        .where(eq(requests.status, "pending")),
    ]);

  return {
    totalProducts: Number(totalProducts[0].count),
    lowStockCount: Number(lowStockCount[0].count),
    todaySalesTotal: parseFloat(todaySales[0].total).toFixed(2),
    pendingRequests: Number(pendingRequests[0].count),
  };
}

async function getRecentTransactions() {
  return db.query.salesTransactions.findMany({
    limit: 5,
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    with: { customer: true },
  });
}

async function getLowStockItems() {
  return db.query.inventory.findMany({
    where: lte(inventory.quantityOnHand, inventory.lowStockThreshold),
    limit: 5,
    with: { product: true },
  });
}

export async function AdminDashboard() {
  const [stats, recentTx, lowStockItems] = await Promise.all([
    getStats(),
    getRecentTransactions(),
    getLowStockItems(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Administrator.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          description="Active products in catalog"
          icon={Package}
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats.lowStockCount}
          description="Products below threshold"
          icon={AlertTriangle}
          variant={stats.lowStockCount > 0 ? "warning" : "default"}
        />
        <StatCard
          title="Today's Sales"
          value={`₱${stats.todaySalesTotal}`}
          description="Total completed transactions"
          icon={DollarSign}
          variant="success"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          description="Awaiting approval"
          icon={ClipboardList}
          variant={stats.pendingRequests > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentTx.length === 0 ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">
                No transactions yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Txn #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTx.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-xs">
                        {tx.transactionNumber}
                      </TableCell>
                      <TableCell>{tx.customer?.name ?? "Walk-in"}</TableCell>
                      <TableCell className="text-right">
                        ₱{parseFloat(tx.totalAmount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tx.status === "completed" ? "default" : "secondary"
                          }
                          className="capitalize"
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {lowStockItems.length === 0 ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">
                All items are well stocked.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">On Hand</TableHead>
                    <TableHead className="text-right">Threshold</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell className="text-right font-medium text-amber-600">
                        {item.quantityOnHand}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {item.lowStockThreshold}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
