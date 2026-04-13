"use client";

import { useState, useMemo, useActionState, useEffect } from "react";
import { toast } from "sonner";
import { toggleServiceAction } from "../actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Search, PlusCircle, Clock, Pencil } from "lucide-react";
import type { ServiceRow } from "./services-table";
import { CreateServiceDialog } from "./create-service-dialog";
import { EditServiceDialog } from "./edit-service-dialog";

const SERVICE_CATEGORIES: Record<string, string> = {
  paint_job: "Paint Job",
  consultation: "Consultation",
  home_service: "Home Service",
  delivery_apply: "Delivery & Apply",
  other: "Other",
};

interface Props {
  initialData: ServiceRow[];
  userRole: "administrator" | "staff";
}

function fmt(n: number | string) {
  return parseFloat(String(n)).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
  });
}

function ToggleServiceButton({ service }: { service: ServiceRow }) {
  const [state, formAction, isPending] = useActionState(
    toggleServiceAction,
    undefined,
  );

  useEffect(() => {
    if (state?.success) toast.success(state.success);
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={service.id} />
      <input
        type="hidden"
        name="isActive"
        value={service.isActive ? "false" : "true"}
      />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={isPending}
        className={
          service.isActive
            ? "text-muted-foreground hover:text-destructive"
            : "text-muted-foreground hover:text-green-600"
        }
      >
        {service.isActive ? "Deactivate" : "Activate"}
      </Button>
    </form>
  );
}

export function ServicesTableClient({ initialData, userRole }: Props) {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ServiceRow | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return initialData.filter(
      (row) =>
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q),
    );
  }, [initialData, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        {userRole === "administrator" && (
          <Button onClick={() => setCreateOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Service
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              {userRole === "administrator" && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={userRole === "administrator" ? 6 : 5}
                  className="h-24 text-center text-muted-foreground"
                >
                  {initialData.length === 0
                    ? "No services yet. Click 'New Service' to add one."
                    : "No results match your search."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => (
                <TableRow
                  key={row.id}
                  className={!row.isActive ? "opacity-60" : ""}
                >
                  <TableCell>
                    <div className="font-medium">{row.name}</div>
                    {row.description && (
                      <div className="text-xs text-muted-foreground truncate max-w-xs">
                        {row.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {SERVICE_CATEGORIES[row.category] ?? row.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    ₱{fmt(row.price)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {row.duration} min
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        row.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {row.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  {userRole === "administrator" && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditTarget(row)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <ToggleServiceButton service={row} />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateServiceDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditServiceDialog
        open={!!editTarget}
        onOpenChange={(o) => {
          if (!o) setEditTarget(null);
        }}
        service={editTarget}
      />
    </div>
  );
}
