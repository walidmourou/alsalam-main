import "dotenv/config";
import { insertMissingByUniqueKey } from "./utils";
import { classRooms } from "../schema";

const classRoomSeedData = [
  { label: "Raum A" },
  { label: "Raum B" },
  { label: "Raum C" },
  { label: "Raum D" },
];

export async function seedClassRoom() {
  console.log("Seeding class rooms...");
  try {
    await insertMissingByUniqueKey(classRooms, "label", classRoomSeedData);
    console.log("✓ Class rooms seeded successfully");
  } catch (error) {
    console.error("Error seeding class rooms:", error);
    throw error;
  }
}

if (require.main === module) {
  seedClassRoom()
    .then(() => {
      console.log("Class room seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Class room seeding failed:", error);
      process.exit(1);
    });
}
