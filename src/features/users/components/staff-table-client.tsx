"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { Search, Plus, Pencil, KeyRound } from "lucide-react";
import { CreateStaffDialog } from "./create-staff-dialog";
import { EditStaffDialog } from "./edit-staff-dialog";
import { ChangePasswordDialog } from "./change-password-dialog";

type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: "administrator" | "staff" | "customer";
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type EditableStaff = Omit<StaffMember, "role"> & {
  role: "administrator" | "staff";
};

interface Props {
  data: StaffMember[];
  totalCount: number;
  page: number;
  pageSize: number;
  search: string;
}

export function StaffTableClient({
  data,
  totalCount,
  page,
  pageSize,
  search: initialSearch,
}: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [searchValue, setSearchValue] = useState(initialSearch);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EditableStaff | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<StaffMember | null>(
    null,
  );

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

  const currentUserId = session?.user?.id ?? "";

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-8"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  {initialSearch
                    ? "No staff members match your search."
                    : "No staff members found."}
                </TableCell>
              </TableRow>
            ) : (
              data.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {staff.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        staff.role === "administrator" ? "default" : "secondary"
                      }
                    >
                      {staff.role === "administrator" ? "Admin" : "Staff"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {staff.phone ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={staff.isActive ? "outline" : "destructive"}>
                      {staff.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditTarget(staff as EditableStaff)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPasswordTarget(staff)}
                      >
                        <KeyRound className="h-4 w-4" />
                        <span className="sr-only">Change Password</span>
                      </Button>
                    </div>
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

      <CreateStaffDialog open={createOpen} onOpenChange={setCreateOpen} />

      {editTarget && (
        <EditStaffDialog
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          staff={editTarget}
          currentUserId={currentUserId}
        />
      )}

      {passwordTarget && (
        <ChangePasswordDialog
          open={!!passwordTarget}
          onOpenChange={(open) => !open && setPasswordTarget(null)}
          staffId={passwordTarget.id}
          staffName={passwordTarget.name}
        />
      )}
    </>
  );
}
