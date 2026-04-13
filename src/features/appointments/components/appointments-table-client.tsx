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
import { CalendarPlus, Search, MapPin } from "lucide-react";
import type { AppointmentRow } from "./appointments-table";
import { CreateAppointmentDialog } from "./create-appointment-dialog";
import { UpdateAppointmentDialog } from "./update-appointment-dialog";

type Customer = { id: string; name: string; phone: string };
type Service = { id: string; name: string; price: string; duration: number };
type StaffMember = { id: string; name: string };

interface Props {
  initialData: AppointmentRow[];
  customers: Customer[];
  servicesList: Service[];
  staffList: StaffMember[];
  userRole: "administrator" | "staff";
}

const STATUS_CONFIG = {
  scheduled: {
    label: "Scheduled",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  confirmed: {
    label: "Confirmed",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  in_progress: {
    label: "In Progress",
    className:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  },
  completed: {
    label: "Completed",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
} as const;

function fmt(n: string | number) {
  return parseFloat(String(n)).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
  });
}

export function AppointmentsTableClient({
  initialData,
  customers,
  servicesList,
  staffList,
  userRole,
}: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<AppointmentRow | null>(null);

  const filtered = useMemo(() => {
    return initialData.filter((row) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        row.appointmentNumber.toLowerCase().includes(q) ||
        row.customerName.toLowerCase().includes(q) ||
        (row.serviceName?.toLowerCase().includes(q) ?? false);
      const matchStatus = statusFilter === "all" || row.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [initialData, search, statusFilter]);

  const canUpdate = (row: AppointmentRow) =>
    row.status !== "completed" && row.status !== "cancelled";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by appointment # or customer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <CalendarPlus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Appt #</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  {initialData.length === 0
                    ? "No appointments yet. Click 'New Appointment' to schedule one."
                    : "No results match your filters."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => {
                const statusCfg = STATUS_CONFIG[row.status];
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {row.appointmentNumber}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      <div>
                        {new Date(row.scheduledAt).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(row.scheduledAt).toLocaleTimeString("en-PH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{row.customerName}</div>
                      <div className="text-xs text-muted-foreground">
                        {row.customerPhone}
                      </div>
                    </TableCell>
                    <TableCell>
                      {row.serviceName ? (
                        <div>
                          <div className="text-sm">{row.serviceName}</div>
                          {row.servicePrice && (
                            <div className="text-xs text-muted-foreground">
                              ₱{fmt(row.servicePrice)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                      {row.address && (
                        <div className="flex items-center gap-0.5 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="h-2.5 w-2.5" />
                          <span className="truncate max-w-24">
                            {row.address}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.staffName ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusCfg.className}>
                        {statusCfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {canUpdate(row) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUpdateTarget(row)}
                        >
                          Update
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <CreateAppointmentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        customers={customers}
        servicesList={servicesList}
        staffList={staffList}
      />
      <UpdateAppointmentDialog
        open={!!updateTarget}
        onOpenChange={(o) => {
          if (!o) setUpdateTarget(null);
        }}
        appointment={updateTarget}
        staffList={staffList}
      />
    </div>
  );
}
