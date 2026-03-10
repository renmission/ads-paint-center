import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/shared/components/dashboard/admin-dashboard";
import { StaffDashboard } from "@/shared/components/dashboard/staff-dashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  if (session.user.role === "administrator") {
    return <AdminDashboard />;
  }

  return (
    <StaffDashboard
      userId={session.user.id}
      userName={session.user.name ?? "Staff"}
    />
  );
}
