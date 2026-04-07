"use client";

import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateAppointmentSchema, type UpdateAppointmentInput } from "../schemas";
import { updateAppointmentAction } from "../actions";
import type { AppointmentRow } from "./appointments-table";
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
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";

const STATUS_ACTIONS: Record<string, { value: string; label: string }[]> = {
  scheduled: [
    { value: "confirm", label: "Confirm" },
    { value: "cancel", label: "Cancel" },
  ],
  confirmed: [
    { value: "start", label: "Start (In Progress)" },
    { value: "cancel", label: "Cancel" },
  ],
  in_progress: [
    { value: "complete", label: "Complete" },
  ],
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

type StaffMember = { id: string; name: string };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentRow | null;
  staffList: StaffMember[];
}

interface InnerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentRow;
  staffList: StaffMember[];
}

function UpdateAppointmentDialogInner({ open, onOpenChange, appointment, staffList }: InnerProps) {
  const [state, formAction, isPending] = useActionState(updateAppointmentAction, undefined);

  const availableActions = STATUS_ACTIONS[appointment.status] ?? [];
  const defaultAction = availableActions[0]?.value ?? "confirm";

  const form = useForm<UpdateAppointmentInput>({
    resolver: zodResolver(updateAppointmentSchema),
    defaultValues: {
      id: appointment.id,
      action: defaultAction as UpdateAppointmentInput["action"],
      staffId: appointment.staffId ?? "",
      notes: appointment.notes ?? "",
    },
  });

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      onOpenChange(false);
    }
    if (state?.error) toast.error(state.error);
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Appointment</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-mono font-medium text-foreground">{appointment.appointmentNumber}</span>
          <Badge variant="outline">{STATUS_LABELS[appointment.status]}</Badge>
        </div>
        <Form {...form}>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="id" value={appointment.id} />
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action</FormLabel>
                  <input type="hidden" name="action" value={field.value} />
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableActions.map((a) => (
                        <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {staffList.length > 0 && (
              <FormField
                control={form.control}
                name="staffId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign Staff (optional)</FormLabel>
                    <input type="hidden" name="staffId" value={field.value ?? ""} />
                    <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {staffList.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Add any notes…" {...field} name="notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function UpdateAppointmentDialog({ open, onOpenChange, appointment, staffList }: Props) {
  if (!appointment) return null;
  return (
    <UpdateAppointmentDialogInner
      open={open}
      onOpenChange={onOpenChange}
      appointment={appointment}
      staffList={staffList}
    />
  );
}
