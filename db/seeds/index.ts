import "dotenv/config";
import { seedGendre } from "./gendre.seed";
import { seedMaritalStatus } from "./maritalStatus.seed";
import { seedRelationshipType } from "./relationshipType.seed";
import { seedEnrollmentStatuses } from "./enrollmentStatuses.seed";
import { seedMembershipStatuses } from "./membershipStatuses.seed";
import { seedMembershipTypes } from "./membershipType.seed";
import { seedCurrency } from "./currency.seed";
import { seedIncomingTypes } from "./incomingTypes.seed";
import { seedEducationLevels } from "./educationLevels.seed";
import { seedEducationalCourse } from "./educationalCourse.seed";
import { seedClassRoom } from "./classRoom.seed";
import { seedPurchaseCategory } from "./purchaseCategory.seed";
import { seedUsers } from "./users.seed";
import { seedMemberships } from "./memberships.seed";
import { seedStudents } from "./students.seed";
import { seedTeachers } from "./teachers.seed";
import { seedAuth } from "./auth.seed";
import { pool } from "../index";

async function runSeeds() {
  console.log("Starting database seeding...\n");

  try {
    // Languages must be seeded first as other seeds depend on it
    await seedGendre();
    await seedMaritalStatus();
    await seedRelationshipType();
    await seedEnrollmentStatuses();
    await seedMembershipStatuses();
    await seedMembershipTypes();
    await seedCurrency();
    await seedIncomingTypes();
    await seedEducationLevels();
    await seedEducationalCourse();
    await seedClassRoom();
    await seedPurchaseCategory();
    await seedUsers();
    await seedMemberships();
    await seedStudents();
    await seedTeachers();
    await seedAuth();

    console.log("\n✓ All seeds completed successfully");
  } catch (error) {
    console.error("\n✗ Seeding failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  runSeeds()
    .then(() => {
      console.log("\nSeeding process finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\nSeeding process failed:", error);
      process.exit(1);
    });
}

export { runSeeds };
