/**
 * Drops all tables and custom types in the public schema.
 * Run ONLY in development to reset the database before a fresh migration.
 */
import { neon } from "@neondatabase/serverless";

async function reset() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log("Resetting public schema...");
  await sql`DROP SCHEMA public CASCADE`;
  await sql`CREATE SCHEMA public`;
  await sql`GRANT ALL ON SCHEMA public TO public`;
  console.log("Schema reset complete. Run pnpm db:migrate to re-apply.");
  process.exit(0);
}

reset().catch((e) => {
  console.error(e);
  process.exit(1);
});
