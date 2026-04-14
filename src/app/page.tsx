import { db } from "@/shared/lib/db";
import { services } from "@/shared/lib/db/schema";
import { eq } from "drizzle-orm";
import { LandingHero } from "./landing-hero";

export const metadata = {
  title: "ADS Paint Center — Quality Paint & Supplies",
  description:
    "Premium paint products, expert service, and fast delivery. Shop interior, exterior, primers, and tools.",
};

export default async function HomePage() {
  const activeServices = await db.query.services.findMany({
    where: eq(services.isActive, true),
    columns: { id: true, name: true, price: true, duration: true },
  });

  return <LandingHero services={activeServices} />;
}
