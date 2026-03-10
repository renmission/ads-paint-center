import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const hashedPassword = await bcrypt.hash("admin123", 12);

  await db
    .insert(users)
    .values({
      name: "Administrator",
      email: "admin@adspaints.com",
      password: hashedPassword,
      role: "administrator",
    })
    .onConflictDoNothing();

  console.log("Seed complete. Admin: admin@adspaints.com / admin123");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
