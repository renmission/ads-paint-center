import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users, products, inventory } from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const SAMPLE_PRODUCTS = [
  { name: "Boysen Permacoat Flat White 4L", sku: "BYS-PF-001", category: "paint" as const, unit: "gallon", price: "485.00", description: "Flat latex paint for interior walls", qty: 25, threshold: 5 },
  { name: "Boysen Permacoat Semi-Gloss White 4L", sku: "BYS-PSG-001", category: "paint" as const, unit: "gallon", price: "510.00", description: "Semi-gloss latex paint for interior walls", qty: 18, threshold: 5 },
  { name: "Davies Roofguard Red 4L", sku: "DAV-RG-001", category: "paint" as const, unit: "gallon", price: "720.00", description: "Acrylic roof paint, weather resistant", qty: 12, threshold: 3 },
  { name: "Boysen Quick Dry Enamel Black 1L", sku: "BYS-QDE-001", category: "paint" as const, unit: "liter", price: "195.00", description: "Fast-drying alkyd enamel for metal and wood", qty: 30, threshold: 8 },
  { name: "Boysen Masonry Putty 4kg", sku: "BYS-MP-001", category: "primer" as const, unit: "kilo", price: "340.00", description: "Fills cracks and imperfections on masonry surfaces", qty: 20, threshold: 5 },
  { name: "Boysen Acrytex Primer 4L", sku: "BYS-AP-001", category: "primer" as const, unit: "gallon", price: "625.00", description: "Acrylic primer for concrete and masonry", qty: 8, threshold: 3 },
  { name: "Boysen Lacquer Thinner 1L", sku: "BYS-LT-001", category: "thinner" as const, unit: "liter", price: "115.00", description: "For thinning lacquer-based paints and varnishes", qty: 50, threshold: 10 },
  { name: "Boysen Epoxy Primer Gray 4L", sku: "BYS-EP-001", category: "coating" as const, unit: "gallon", price: "1250.00", description: "Two-component epoxy primer for metal surfaces", qty: 6, threshold: 2 },
  { name: "Davies Acqua Varnish Gloss 1L", sku: "DAV-AV-001", category: "varnish" as const, unit: "liter", price: "285.00", description: "Water-based varnish for wood, fast-drying", qty: 15, threshold: 4 },
  { name: "4-inch Paint Roller with Tray Set", sku: "TOOL-RT-001", category: "tool" as const, unit: "set", price: "150.00", description: "Includes roller frame, cover, and plastic tray", qty: 22, threshold: 5 },
  { name: "3-inch Paint Brush (Flat)", sku: "TOOL-PB-001", category: "tool" as const, unit: "piece", price: "65.00", description: "Nylon bristle flat brush for general use", qty: 35, threshold: 10 },
  { name: "Masking Tape 1-inch x 50m", sku: "SUP-MT-001", category: "supply" as const, unit: "roll", price: "45.00", description: "General purpose masking tape", qty: 3, threshold: 10 },
];

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema: { users, products, inventory } });

  // --- Admin user ---
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

  // --- Products + Inventory ---
  for (const item of SAMPLE_PRODUCTS) {
    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.sku, item.sku));

    let productId: string;

    if (existing.length > 0) {
      productId = existing[0].id;
      console.log(`  skip (exists): ${item.name}`);
    } else {
      const [inserted] = await db
        .insert(products)
        .values({
          name: item.name,
          sku: item.sku,
          description: item.description,
          category: item.category,
          unit: item.unit,
          price: item.price,
        })
        .returning({ id: products.id });

      productId = inserted.id;

      await db.insert(inventory).values({
        productId,
        quantityOnHand: item.qty,
        lowStockThreshold: item.threshold,
        lastRestockedAt: new Date(),
      });

      console.log(`  added: ${item.name} (qty: ${item.qty})`);
    }
  }

  console.log("\nSeed complete.");
  console.log("  Admin: admin@adspaints.com / admin123");
  console.log(`  Products seeded: ${SAMPLE_PRODUCTS.length}`);
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
