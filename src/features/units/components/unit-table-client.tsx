"use client";

import { useState } from "react";
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
import { Input } from "@/shared/components/ui/input";
import { Search, Plus, Pencil } from "lucide-react";
import { CreateUnitDialog } from "./create-unit-dialog";
import { EditUnitDialog } from "./edit-unit-dialog";
import type { UnitRow } from "./unit-table";

interface Props {
  initialData: UnitRow[];
}

export function UnitTableClient({ initialData }: Props) {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UnitRow | null>(null);

  const filtered = initialData.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.abbreviation.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or abbreviation..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Unit
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Abbreviation</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  {search
                    ? "No units match your search."
                    : "No units found. Add one to get started."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium capitalize">
                    {unit.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {unit.abbreviation}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={unit.isActive ? "secondary" : "outline"}
                      className={!unit.isActive ? "text-muted-foreground" : ""}
                    >
                      {unit.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditTarget(unit)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {initialData.length} units
      </p>

      <CreateUnitDialog open={createOpen} onOpenChange={setCreateOpen} />

      {editTarget && (
        <EditUnitDialog
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          unit={editTarget}
        />
      )}
    </>
  );
}
