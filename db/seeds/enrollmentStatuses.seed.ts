import "dotenv/config";
import { insertMissingByUniqueKey } from "./utils";
import { enrollmentStatuses } from "../schema";

const enrollmentStatusSeedData = [
  { label: "Eingeschrieben" },
  { label: "Ausstehend" },
  { label: "Abgeschlossen" },
  { label: "Zurückgezogen" },
  { label: "Ausgesetzt" },
];

export async function seedEnrollmentStatuses() {
  console.log("Seeding enrollment statuses...");
  try {
    await insertMissingByUniqueKey(
      enrollmentStatuses,
      "label",
      enrollmentStatusSeedData,
    );
    console.log("✓ Enrollment statuses seeded successfully");
  } catch (error) {
    console.error("Error seeding enrollment statuses:", error);
    throw error;
  }
}

if (require.main === module) {
  seedEnrollmentStatuses()
    .then(() => {
      console.log("Enrollment status seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Enrollment status seeding failed:", error);
      process.exit(1);
    });
}
