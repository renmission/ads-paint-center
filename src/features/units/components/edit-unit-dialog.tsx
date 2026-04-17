"use client";

import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateUnitSchema, type UpdateUnitInput } from "../schemas";
import { updateUnitAction, toggleUnitActiveAction } from "../actions";
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
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import type { UnitRow } from "./unit-table";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: UnitRow;
}

export function EditUnitDialog({ open, onOpenChange, unit }: Props) {
  const [state, formAction, isPending] = useActionState(
    updateUnitAction,
    undefined,
  );

  const [toggleState, toggleAction, isTogglePending] = useActionState(
    toggleUnitActiveAction,
    undefined,
  );

  const form = useForm<UpdateUnitInput>({
    resolver: zodResolver(updateUnitSchema),
    defaultValues: {
      id: unit.id,
      name: unit.name,
      abbreviation: unit.abbreviation,
    },
  });

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      onOpenChange(false);
    }
    if (state?.error) toast.error(state.error);
  }, [state]);

  useEffect(() => {
    if (toggleState?.success) {
      toast.success(toggleState.success);
      onOpenChange(false);
    }
    if (toggleState?.error) toast.error(toggleState.error);
  }, [toggleState]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Unit</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="id" value={unit.id} />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="abbreviation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Abbreviation</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <form action={toggleAction} className="mr-auto">
                <input type="hidden" name="id" value={unit.id} />
                <input
                  type="hidden"
                  name="isActive"
                  value={String(unit.isActive)}
                />
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isTogglePending}
                  className={
                    unit.isActive
                      ? "text-destructive hover:text-destructive"
                      : ""
                  }
                >
                  {isTogglePending
                    ? "..."
                    : unit.isActive
                      ? "Archive"
                      : "Restore"}
                </Button>
              </form>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
