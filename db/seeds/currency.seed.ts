import "dotenv/config";
import { insertMissingByUniqueKey } from "./utils";
import { currencies } from "../schema";

const currencySeedData = [
  { code: "EUR", label: "Euro" },
  { code: "USD", label: "US-Dollar" },
  { code: "CHF", label: "Schweizer Franken" },
];

export async function seedCurrency() {
  console.log("Seeding currencies...");
  try {
    await insertMissingByUniqueKey(currencies, "code", currencySeedData);
    console.log("✓ Currencies seeded successfully");
  } catch (error) {
    console.error("Error seeding currencies:", error);
    throw error;
  }
}
// Run if called directly
if (require.main === module) {
  seedCurrency()
    .then(() => {
      console.log("Currency seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Currency seeding failed:", error);
      process.exit(1);
    });
}
