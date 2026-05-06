"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { TablePagination } from "@/shared/components/ui/table-pagination";
import { Search, PlusCircle, MapPin } from "lucide-react";
import type { ServiceJobRow } from "../queries";
import { ServiceJobDetailsDialog } from "./service-job-details-dialog";
import { CreateServiceJobDialog } from "./create-service-job-dialog";

type Customer = { id: string; name: string; phone: string; address: string | null };
type Service = { id: string; name: string; price: string; duration: number };
type StaffMember = { id: string; name: string };
type Product = { id: string; name: string; price: string; unit: string };

interface Props {
  data: ServiceJobRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  search: string;
  userRole: "administrator" | "staff";
  customers: Customer[];
  servicesList: Service[];
  staffList: StaffMember[];
  products: Product[];
}

const STATUS_CONFIG: Record<
  ServiceJobRow["status"],
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  },
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
};

export function ServiceJobsTableClient({
  data,
  totalCount,
  page,
  pageSize,
  search,
  userRole,
  customers,
  servicesList,
  staffList,
  products,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(search);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchValue) {
        params.set("search", searchValue);
      } else {
        params.delete("search");
      }
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, pathname, router, searchParams]);

  const isAdmin = userRole === "administrator";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search jobs, clients…"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <PlusCircle className="mr-1.5 h-4 w-4" />
            New Service Job
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground"
                >
                  {search
                    ? "No service jobs match your search."
                    : 'No service jobs yet. Click "New Service Job" to get started.'}
                </TableCell>
              </TableRow>
            ) : (
              data.map((job) => (
                <TableRow
                  key={job.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedJobId(job.id)}
                >
                  <TableCell className="font-mono text-sm">
                    {job.jobNumber}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{job.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.customerPhone}
                    </p>
                    {(job.address || job.customerAddress) && (
                      <p className="text-xs text-muted-foreground flex items-center gap-0.5 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {(job.address || job.customerAddress)?.slice(0, 40)}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {job.serviceName ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {job.scheduledAt
                      ? job.scheduledAt.toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_CONFIG[job.status].className}>
                      {STATUS_CONFIG[job.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₱{(
                      parseFloat(job.totalAmount) +
                      (job.servicePrice ? parseFloat(job.servicePrice) : 0)
                    ).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
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

      <ServiceJobDetailsDialog
        jobId={selectedJobId}
        canManage={isAdmin}
        open={selectedJobId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedJobId(null);
        }}
      />

      {isAdmin && (
        <CreateServiceJobDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          customers={customers}
          servicesList={servicesList}
          staffList={staffList}
          products={products}
        />
      )}
    </div>
  );
}
