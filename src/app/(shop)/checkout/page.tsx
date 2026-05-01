import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";
import { users } from "@/shared/lib/db/schema";
import { CheckoutForm } from "./checkout-form";

export const metadata = { title: "Checkout — ADS Paint Center" };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) redirect("/shop/login?redirect=/checkout");

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { name: true, email: true, phone: true },
  });

  return (
    <CheckoutForm
      initialContact={{
        name: user?.name ?? session.user.name ?? "",
        email: user?.email ?? session.user.email ?? "",
        phone: user?.phone ?? "",
      }}
    />
  );
}
