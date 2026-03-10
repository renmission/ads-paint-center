import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import { StaffTable } from "@/features/users/components/staff-table";

export default async function StaffPage() {
  const session = await auth();
  if (!session || session.user.role !== "administrator") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff</h1>
        <p className="text-muted-foreground">
          Manage store personnel and their access.
        </p>
      </div>
      <StaffTable />
    </div>
  );
}
