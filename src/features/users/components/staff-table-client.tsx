"use client";

import { useState } from "react";
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
import { Search, Plus, Pencil, KeyRound } from "lucide-react";
import { CreateStaffDialog } from "./create-staff-dialog";
import { EditStaffDialog } from "./edit-staff-dialog";
import { ChangePasswordDialog } from "./change-password-dialog";

type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: "administrator" | "staff";
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

interface Props {
  initialData: StaffMember[];
}

export function StaffTableClient({ initialData }: Props) {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<StaffMember | null>(null);

  const filtered = initialData.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const currentUserId = session?.user?.id ?? "";

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  {search ? "No staff members match your search." : "No staff members found."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.name}</TableCell>
                  <TableCell className="text-muted-foreground">{staff.email}</TableCell>
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
                        onClick={() => setEditTarget(staff)}
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

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {initialData.length} staff members
      </p>

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
