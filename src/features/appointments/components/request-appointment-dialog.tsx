"use client";

import { useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  requestAppointmentSchema,
  type RequestAppointmentInput,
} from "../schemas";
import { requestAppointmentAction } from "../actions";
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
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";

type Service = { id: string; name: string; price: string; duration: number };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: Service[];
}

function fmt(n: string) {
  return parseFloat(n).toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

const STEP_LABELS = ["Customer Info", "Appointment Details"];

export function RequestAppointmentDialog({
  open,
  onOpenChange,
  services,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);

  const [state, formAction, isPending] = useActionState(
    requestAppointmentAction,
    undefined,
  );

  const form = useForm<RequestAppointmentInput>({
    resolver: zodResolver(requestAppointmentSchema),
    defaultValues: {
      name: "",
      phone: "",
      serviceId: "",
      scheduledAt: "",
      address: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      form.reset();
      setStep(1);
      onOpenChange(false);
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state, form, onOpenChange]);

  function handleClose(value: boolean) {
    if (!value) {
      form.reset();
      setStep(1);
    }
    onOpenChange(value);
  }

  async function handleNext() {
    const valid = await form.trigger(["name", "phone"]);
    if (valid) setStep(2);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Get a Quote</DialogTitle>
          {/* Step indicator */}
          <div className="mt-3 flex items-center gap-2">
            {STEP_LABELS.map((label, i) => {
              const n = (i + 1) as 1 | 2;
              const active = step === n;
              const done = step > n;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      active
                        ? "bg-primary text-white"
                        : done
                          ? "bg-primary/20 text-primary"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {n}
                  </div>
                  <span
                    className={`text-xs ${active ? "font-medium text-slate-900" : "text-slate-400"}`}
                  >
                    {label}
                  </span>
                  {i < STEP_LABELS.length - 1 && (
                    <div className="h-px w-6 bg-slate-200" />
                  )}
                </div>
              );
            })}
          </div>
        </DialogHeader>

        <Form {...form}>
          <form action={formAction} className="space-y-4">
            {/* ── Step 1: Customer Info ── */}
            {step === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan dela Cruz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="09XXXXXXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* ── Step 2: Appointment Details ── */}
            {step === 2 && (
              <>
                {/* Hidden fields so FormData includes step-1 values on submit */}
                <input
                  type="hidden"
                  name="name"
                  value={form.getValues("name")}
                />
                <input
                  type="hidden"
                  name="phone"
                  value={form.getValues("phone")}
                />

                <FormField
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service (optional)</FormLabel>
                      <input
                        type="hidden"
                        name="serviceId"
                        value={field.value}
                      />
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service…" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {services.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name} — ₱{fmt(s.price)} ({s.duration} min)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scheduledAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Date & Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Service location or delivery address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any special requests or details…"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              {step === 1 ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleClose(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleNext}>
                    Next
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isPending}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Submitting…" : "Submit Request"}
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
