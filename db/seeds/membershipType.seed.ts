import "dotenv/config";
import { insertMissingByUniqueKey } from "./utils";
import { membershipTypes } from "../schema";

const membershipTypeSeedData = [
  {
    label: "Aktivmitglied",
    description: "Reguläres aktives Mitglied mit vollem Stimmrecht",
    monthlyFee: "10.00",
    annualFee: "100.00",
  },
  {
    label: "Fördermitglied",
    description: "Unterstützt die Vereinsziele durch Spenden",
    monthlyFee: "25.00",
    annualFee: "250.00",
  },
  {
    label: "Ehrenmitglied",
    description: "Besondere Anerkennung für langjährige Verdienste",
    monthlyFee: "0.00",
    annualFee: "0.00",
  },
  {
    label: "Studentenmitglied",
    description: "Ermäßigte Mitgliedschaft für Studierende",
    monthlyFee: "5.00",
    annualFee: "50.00",
  },
  {
    label: "Familienmitgliedschaft",
    description: "Mitgliedschaft für die ganze Familie",
    monthlyFee: "15.00",
    annualFee: "150.00",
  },
  {
    label: "Unternehmensmitglied",
    description: "Mitgliedschaft für Unternehmen und Organisationen",
    monthlyFee: "50.00",
    annualFee: "500.00",
  },
  {
    label: "Jugendmitglied",
    description: "Mitgliedschaft für Kinder und Jugendliche unter 18 Jahren",
    monthlyFee: "3.00",
    annualFee: "30.00",
  },
];

export async function seedMembershipTypes() {
  console.log("Seeding membership types...");
  try {
    await insertMissingByUniqueKey(
      membershipTypes,
      "label",
      membershipTypeSeedData,
    );
    console.log("✓ Membership types seeded successfully");
  } catch (error) {
    console.error("Error seeding membership types:", error);
    throw error;
  }
}

if (require.main === module) {
  seedMembershipTypes()
    .then(() => {
      console.log("Membership type seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Membership type seeding failed:", error);
      process.exit(1);
    });
}
