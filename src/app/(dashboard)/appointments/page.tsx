import { AppointmentsTable } from "@/features/appointments/components/appointments-table";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground">
          Schedule and manage service appointments.
        </p>
      </div>
      <AppointmentsTable searchParams={await searchParams} />
    </div>
  );
}
