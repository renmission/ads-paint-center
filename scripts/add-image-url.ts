import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url varchar(500)`;
  console.log("image_url column added to products table");
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
