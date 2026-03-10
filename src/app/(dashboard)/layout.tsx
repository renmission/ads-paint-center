import { auth } from "@/shared/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/shared/components/layout/sidebar";
import { Header } from "@/shared/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const role = session.user.role;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={session.user} role={role} />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 dark:bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}
