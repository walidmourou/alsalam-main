import "dotenv/config";
import { insertMissingByUniqueKey } from "./utils";
import { membershipStatuses } from "../schema";

const membershipStatusSeedData = [
  { label: "Aktiv" },
  { label: "Inaktiv" },
  { label: "Ausgesetzt" },
  { label: "Abgelaufen" },
  { label: "Ausstehend" },
];

export async function seedMembershipStatuses() {
  console.log("Seeding membership statuses...");
  try {
    await insertMissingByUniqueKey(
      membershipStatuses,
      "label",
      membershipStatusSeedData,
    );
    console.log("✓ Membership statuses seeded successfully");
  } catch (error) {
    console.error("Error seeding membership statuses:", error);
    throw error;
  }
}

if (require.main === module) {
  seedMembershipStatuses()
    .then(() => {
      console.log("Membership status seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Membership status seeding failed:", error);
      process.exit(1);
    });
}
