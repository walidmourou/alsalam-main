import "dotenv/config";
import { insertMissingByUniqueKey } from "./utils";
import { relationshipTypes } from "../schema";

const relationshipTypeSeedData = [
  { label: "Vater" },
  { label: "Mutter" },
  { label: "Bruder" },
  { label: "Schwester" },
  { label: "Onkel" },
  { label: "Andere" },
];

export async function seedRelationshipType() {
  console.log("Seeding relationship types...");
  try {
    await insertMissingByUniqueKey(
      relationshipTypes,
      "label",
      relationshipTypeSeedData,
    );
    console.log("✓ Relationship types seeded successfully");
  } catch (error) {
    console.error("Error seeding relationship types:", error);
    throw error;
  }
}

if (require.main === module) {
  seedRelationshipType()
    .then(() => {
      console.log("Relationship type seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Relationship type seeding failed:", error);
      process.exit(1);
    });
}
