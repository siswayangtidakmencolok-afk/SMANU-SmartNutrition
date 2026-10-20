/**
 * scripts/get-usda-samples.ts
 * Quick script to fetch sample foodIds for HTTP testing.
 */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { foodItems } from "../lib/db/schema";
import { eq, isNull, isNotNull, and } from "drizzle-orm";

async function main() {
  const db = drizzle(neon(process.env.DATABASE_URL!), { schema: { foodItems } });

  const usda = await db
    .select({ foodId: foodItems.foodId, namePrimary: foodItems.namePrimary, energyKcal: foodItems.energyKcal, proteinG: foodItems.proteinG, typicalPortionG: foodItems.typicalPortionG })
    .from(foodItems)
    .where(eq(foodItems.dataSource, "USDA-FDC"))
    .limit(5);

  const usdaNoEnergy = await db
    .select({ foodId: foodItems.foodId, namePrimary: foodItems.namePrimary, energyKcal: foodItems.energyKcal, proteinG: foodItems.proteinG })
    .from(foodItems)
    .where(and(eq(foodItems.dataSource, "USDA-FDC"), isNull(foodItems.energyKcal), isNotNull(foodItems.proteinG)))
    .limit(3);

  console.log("USDA_SAMPLE=" + JSON.stringify(usda));
  console.log("USDA_NO_ENERGY=" + JSON.stringify(usdaNoEnergy));
}

main().catch(e => { console.error(e); process.exit(1); });
