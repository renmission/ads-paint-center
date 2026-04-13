import { db } from "@/shared/lib/db";
import { salesTransactions, requests, inventory } from "@/shared/lib/db/schema";
import { eq, lte, sql, and, gte } from "drizzle-orm";
import { StatCard } from "./stat-card";
import { ShoppingCart, ClipboardList, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import Link from "next/link";

async function getStaffStats(staffId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [myTodaySales, pendingRequests, lowStockCount] = await Promise.all([
    db
      .select({
        count: sql<number>`count(*)`,
        total: sql<string>`coalesce(sum(total_amount), 0)`,
      })
      .from(salesTransactions)
      .where(
        and(
          eq(salesTransactions.staffId, staffId),
          eq(salesTransactions.status, "completed"),
          gte(salesTransactions.createdAt, today),
        ),
      ),
    db
      .select({ count: sql<number>`count(*)` })
      .from(requests)
      .where(eq(requests.status, "pending")),
    db
      .select({ count: sql<number>`count(*)` })
      .from(inventory)
      .where(lte(inventory.quantityOnHand, inventory.lowStockThreshold)),
  ]);

  return {
    mySalesToday: Number(myTodaySales[0].count),
    myTodayTotal: parseFloat(myTodaySales[0].total).toFixed(2),
    pendingRequests: Number(pendingRequests[0].count),
    lowStockCount: Number(lowStockCount[0].count),
  };
}

async function getRecentPendingRequests() {
  return db.query.requests.findMany({
    where: eq(requests.status, "pending"),
    limit: 5,
    orderBy: (r, { desc }) => [desc(r.createdAt)],
    with: { customer: true, product: true },
  });
}

interface StaffDashboardProps {
  userId: string;
  userName: string;
}

export async function StaffDashboard({
  userId,
  userName,
}: StaffDashboardProps) {
  const [stats, pendingReqs] = await Promise.all([
    getStaffStats(userId),
    getRecentPendingRequests(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {userName}.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="My Sales Today"
          value={`₱${stats.myTodayTotal}`}
          description={`${stats.mySalesToday} transaction(s)`}
          icon={ShoppingCart}
          variant="success"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          description="Awaiting approval"
          icon={ClipboardList}
          variant={stats.pendingRequests > 0 ? "warning" : "default"}
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats.lowStockCount}
          description="Items below threshold"
          icon={AlertTriangle}
          variant={stats.lowStockCount > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Quick action */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/sales/new">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Start New Sale
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/requests">
                <ClipboardList className="mr-2 h-4 w-4" />
                View All Requests
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Pending Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {pendingReqs.length === 0 ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">
                No pending requests.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingReqs.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>{req.customer.name}</TableCell>
                      <TableCell>
                        {req.product?.name ?? req.productDescription ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {req.status}
                        </Badge>
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
