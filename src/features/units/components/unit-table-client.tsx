"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
import { TablePagination } from "@/shared/components/ui/table-pagination";
import { Search, Plus, Pencil } from "lucide-react";
import { CreateUnitDialog } from "./create-unit-dialog";
import { EditUnitDialog } from "./edit-unit-dialog";
import type { UnitRow } from "./unit-table";

interface Props {
  data: UnitRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  search: string;
}

export function UnitTableClient({
  data,
  totalCount,
  page,
  pageSize,
  search: initialSearch,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [searchValue, setSearchValue] = useState(initialSearch);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UnitRow | null>(null);

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

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or abbreviation..."
            className="pl-8"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
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
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  {initialSearch
                    ? "No units match your search."
                    : "No units found. Add one to get started."}
                </TableCell>
              </TableRow>
            ) : (
              data.map((unit) => (
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

      <TablePagination
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
      />

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
