import "dotenv/config";
import { insertMissingByUniqueKey } from "./utils";
import { educationalCourses } from "../schema";

const educationalCourseSeedData = [{ label: "Arabisch" }, { label: "Islam" }];

export async function seedEducationalCourse() {
  console.log("Seeding educational courses...");
  try {
    await insertMissingByUniqueKey(
      educationalCourses,
      "label",
      educationalCourseSeedData,
    );
    console.log("✓ Educational courses seeded successfully");
  } catch (error) {
    console.error("Error seeding educational courses:", error);
    throw error;
  }
}

if (require.main === module) {
  seedEducationalCourse()
    .then(() => {
      console.log("Educational course seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Educational course seeding failed:", error);
      process.exit(1);
    });
}
