"use client";

import { useActionState, useEffect, useTransition, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Popover } from "radix-ui";
import {
  createServiceJobSchema,
  type CreateServiceJobInput,
} from "../schemas";
import { createServiceJobAction } from "../actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ServiceJobItemsField } from "./service-job-items-field";

type Customer = { id: string; name: string; phone: string; address: string | null };
type Service = { id: string; name: string; price: string; duration: number };
type StaffMember = { id: string; name: string };
type Product = { id: string; name: string; price: string; unit: string };

interface SearchableSelectProps<T extends { id: string }> {
  items: T[];
  value: string;
  onSelect: (id: string) => void;
  placeholder: string;
  renderLabel: (item: T) => string;
  renderOption: (item: T) => React.ReactNode;
  emptyOption?: { label: string; value: string };
  className?: string;
}

function SearchableSelect<T extends { id: string }>({
  items,
  value,
  onSelect,
  placeholder,
  renderLabel,
  renderOption,
  emptyOption,
  className,
}: SearchableSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = items.find((i) => i.id === value);
  const isEmptySelected = emptyOption && value === emptyOption.value;

  const filtered =
    search.trim() === ""
      ? items
      : items.filter((i) =>
          renderLabel(i).toLowerCase().includes(search.toLowerCase()),
        );

  const displayLabel = isEmptySelected
    ? emptyOption.label
    : selected
    ? renderLabel(selected)
    : null;

  return (
    <Popover.Root
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) {
          setSearch("");
          setTimeout(() => inputRef.current?.focus(), 0);
        }
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            !displayLabel && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{displayLabel ?? placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 w-[var(--radix-popover-trigger-width)] rounded-md border bg-popover p-0 shadow-md"
          align="start"
          sideOffset={4}
        >
          <div className="p-2 border-b">
            <Input
              ref={inputRef}
              className="h-8 text-sm"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {emptyOption && (
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent",
                  value === emptyOption.value && "font-medium",
                )}
                onClick={() => {
                  onSelect(emptyOption.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "h-4 w-4 shrink-0",
                    value === emptyOption.value ? "opacity-100" : "opacity-0",
                  )}
                />
                {emptyOption.label}
              </button>
            )}

            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                No results found.
              </p>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent",
                    item.id === value && "font-medium",
                  )}
                  onClick={() => {
                    onSelect(item.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      item.id === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {renderOption(item)}
                </button>
              ))
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Customer[];
  servicesList: Service[];
  staffList: StaffMember[];
  products: Product[];
}

export function CreateServiceJobDialog({
  open,
  onOpenChange,
  customers,
  servicesList,
  staffList,
  products,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    createServiceJobAction,
    undefined,
  );
  const [, startTransition] = useTransition();

  const form = useForm<CreateServiceJobInput>({
    resolver: zodResolver(createServiceJobSchema),
    defaultValues: {
      customerId: "",
      serviceId: "",
      scheduledAt: "",
      address: "",
      notes: "",
      handledBy: "",
      items: [],
    },
  });

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success, {
        description: state.success.includes("scheduled")
          ? "Customer will receive an SMS confirmation."
          : undefined,
      });
      form.reset();
      onOpenChange(false);
    }
    if (state?.error) toast.error(state.error);
  }, [state, form, onOpenChange]);

  const handleClose = (o: boolean) => {
    if (!o) form.reset();
    onOpenChange(o);
  };

  const handleSubmit = form.handleSubmit((data) => {
    const fd = new FormData();
    fd.set("customerId", data.customerId);
    fd.set("serviceId", data.serviceId ?? "");
    fd.set("scheduledAt", data.scheduledAt ?? "");
    fd.set("address", data.address ?? "");
    fd.set("notes", data.notes ?? "");
    fd.set("handledBy", data.handledBy ?? "");
    fd.set("items", JSON.stringify(data.items));
    startTransition(() => formAction(fd));
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Service Job</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Customer <span className="text-destructive">*</span>
                    </FormLabel>
                    <SearchableSelect
                      items={customers}
                      value={field.value}
                      onSelect={(id) => {
                        field.onChange(id);
                        const customer = customers.find((c) => c.id === id);
                        form.setValue("address", customer?.address ?? "");
                      }}
                      placeholder="Select customer…"
                      renderLabel={(c) => `${c.name} — ${c.phone}`}
                      renderOption={(c) => (
                        <span className="flex flex-col text-left">
                          <span>{c.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {c.phone}
                          </span>
                        </span>
                      )}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <SearchableSelect
                      items={servicesList}
                      value={field.value ?? ""}
                      onSelect={(id) => field.onChange(id === "__none__" ? "" : id)}
                      placeholder="Select service…"
                      renderLabel={(s) => s.name}
                      renderOption={(s) => (
                        <span className="flex flex-1 items-center justify-between">
                          <span>{s.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ₱{parseFloat(s.price).toFixed(2)}
                          </span>
                        </span>
                      )}
                      emptyOption={{ label: "No specific service", value: "__none__" }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduledAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule Date & Time</FormLabel>
                    <Input
                      type="datetime-local"
                      {...field}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="handledBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Staff</FormLabel>
                    <Select
                      value={field.value || "none"}
                      onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Unassigned…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {staffList.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Job Site Address <span className="text-destructive">*</span>
                  </FormLabel>
                  <Textarea
                    placeholder="Enter the address where the service will be performed…"
                    rows={2}
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <Textarea
                    placeholder="Additional notes…"
                    rows={2}
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-md border p-3 space-y-2">
              <ServiceJobItemsField
                control={form.control}
                products={products}
                setValue={(name, value) =>
                  form.setValue(name, value as never, { shouldDirty: true })
                }
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
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating…" : "Create Job"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
