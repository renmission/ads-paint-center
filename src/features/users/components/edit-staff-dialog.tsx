"use client";

import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateStaffSchema, type UpdateStaffInput } from "../schemas";
import { updateStaffAction, toggleStaffActiveAction } from "../actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "administrator" | "staff";
  phone: string | null;
  isActive: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffMember;
  currentUserId: string;
}

export function EditStaffDialog({
  open,
  onOpenChange,
  staff,
  currentUserId,
}: Props) {
  const [updateState, updateFormAction, isUpdatePending] = useActionState(
    updateStaffAction,
    undefined,
  );
  const [toggleState, toggleFormAction, isTogglePending] = useActionState(
    toggleStaffActiveAction,
    undefined,
  );

  const form = useForm<UpdateStaffInput>({
    resolver: zodResolver(updateStaffSchema),
    defaultValues: {
      id: staff.id,
      name: staff.name,
      phone: staff.phone ?? "",
      role: staff.role,
    },
  });

  useEffect(() => {
    if (updateState?.success) {
      toast.success(updateState.success);
      onOpenChange(false);
    }
    if (updateState?.error) toast.error(updateState.error);
  }, [updateState]);

  useEffect(() => {
    if (toggleState?.success) {
      toast.success(toggleState.success);
      onOpenChange(false);
    }
    if (toggleState?.error) toast.error(toggleState.error);
  }, [toggleState]);

  const isSelf = currentUserId === staff.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form action={updateFormAction} className="space-y-4">
            <input type="hidden" name="id" value={staff.id} />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      name="role"
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="administrator">
                          Administrator
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="09XX XXX XXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdatePending}>
                {isUpdatePending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {/* Toggle Active — separate form */}
        {!isSelf && (
          <div className="border-t pt-4">
            <form
              action={toggleFormAction}
              className="flex items-center justify-between"
            >
              <input type="hidden" name="id" value={staff.id} />
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Account Status</p>
                <p className="text-xs text-muted-foreground">
                  {staff.isActive
                    ? "Account is active"
                    : "Account is deactivated"}
                </p>
              </div>
              <button type="submit" disabled={isTogglePending}>
                <Switch
                  checked={staff.isActive}
                  disabled={isTogglePending}
                  aria-label="Toggle staff active status"
                />
              </button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
