import "dotenv/config";
import { insertMissingByUniqueKey } from "./utils";
import { incomingTypes } from "../schema";

const incomingTypeSeedData = [
  { label: "Mitgliedsbeitrag" },
  { label: "Spende" },
  { label: "Studiengebühr" },
  { label: "Anmeldegebühr" },
  { label: "Veranstaltungsgebühr" },
  { label: "Sonstiges" },
];

export async function seedIncomingTypes() {
  console.log("Seeding incoming types...");
  try {
    await insertMissingByUniqueKey(
      incomingTypes,
      "label",
      incomingTypeSeedData,
    );
    console.log("✓ Incoming types seeded successfully");
  } catch (error) {
    console.error("Error seeding incoming types:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedIncomingTypes()
    .then(() => {
      console.log("Incoming type seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Incoming type seeding failed:", error);
      process.exit(1);
    });
}
