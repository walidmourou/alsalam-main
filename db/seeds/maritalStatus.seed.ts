import "dotenv/config";
import { insertMissingByUniqueKey } from "./utils";
import { maritalStatuses } from "../schema";

const maritalStatusSeedData = [
  { label: "Ledig" },
  { label: "Verheiratet" },
  { label: "Geschieden" },
  { label: "Verwitwet" },
];

export async function seedMaritalStatus() {
  console.log("Seeding marital statuses...");
  try {
    await insertMissingByUniqueKey(
      maritalStatuses,
      "label",
      maritalStatusSeedData,
    );
    console.log("✓ Marital statuses seeded successfully");
  } catch (error) {
    console.error("Error seeding marital statuses:", error);
    throw error;
  }
}

if (require.main === module) {
  seedMaritalStatus()
    .then(() => {
      console.log("Marital status seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Marital status seeding failed:", error);
      process.exit(1);
    });
}
