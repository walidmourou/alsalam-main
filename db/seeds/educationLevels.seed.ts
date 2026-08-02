import "dotenv/config";
import { insertMissingByUniqueKey } from "./utils";
import { educationLevels } from "../schema";

const educationLevelSeedData = [
  {
    label: "Vorbereitungsstufe",
    description: "Vorbereitungsstufe",
    sortOrder: 0,
  },
  {
    label: "Primarstufe",
    description: "Primarstufe",
    sortOrder: 1,
  },
  {
    label: "Zwischenstufe",
    description: "Zwischenstufe",
    sortOrder: 2,
  },
  {
    label: "Sekundarstufe",
    description: "Sekundarstufe",
    sortOrder: 3,
  },
  {
    label: "Fortgeschrittenes Niveau",
    description: "Fortgeschrittenes Niveau",
    sortOrder: 4,
  },
];

export async function seedEducationLevels() {
  console.log("Seeding education levels...");
  try {
    await insertMissingByUniqueKey(
      educationLevels,
      "label",
      educationLevelSeedData,
    );
    console.log("✓ Education levels seeded successfully");
  } catch (error) {
    console.error("Error seeding education levels:", error);
    throw error;
  }
}

if (require.main === module) {
  seedEducationLevels()
    .then(() => {
      console.log("Education level seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Education level seeding failed:", error);
      process.exit(1);
    });
}
