import "dotenv/config";
import { insertMissingByUniqueKey } from "./utils";
import { purchaseCategories } from "../schema";

const purchaseCategorySeedData = [
  { label: "Bildungsmaterialien" },
  { label: "Gebetsveranstaltungskosten" },
  { label: "Gemeinde Outreach" },
  { label: "Freiwilligenunterstützung" },
  { label: "Gebäudewartung" },
];

export async function seedPurchaseCategory() {
  console.log("Seeding purchase categories...");
  try {
    await insertMissingByUniqueKey(
      purchaseCategories,
      "label",
      purchaseCategorySeedData,
    );
    console.log("✓ Purchase categories seeded successfully");
  } catch (error) {
    console.error("Error seeding purchase categories:", error);
    throw error;
  }
}
if (require.main === module) {
  seedPurchaseCategory()
    .then(() => {
      console.log("Purchase category seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Purchase category seeding failed:", error);
      process.exit(1);
    });
}
