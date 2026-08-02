import "dotenv/config";
import { insertMissingByUniqueKey } from "./utils";
import { genders } from "../schema";

const gendreSeedData = [{ label: "Männlich" }, { label: "Weiblich" }];

export async function seedGendre() {
  console.log("Seeding genders...");
  try {
    await insertMissingByUniqueKey(genders, "label", gendreSeedData);
    console.log("✓ Genders seeded successfully");
  } catch (error) {
    console.error("Error seeding genders:", error);
    throw error;
  }
}

if (require.main === module) {
  seedGendre()
    .then(() => {
      console.log("Gender seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Gender seeding failed:", error);
      process.exit(1);
    });
}
