import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { db } from "../index";
import { memberships } from "../schema";

const CSV_PATH = path.join(__dirname, "..", "memberships.csv");

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function parseCsv(content: string) {
  const lines = content.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const record: Record<string, string> = {};

    headers.forEach((header, index) => {
      record[header] = values[index] ? values[index].trim() : "";
    });

    return record;
  });
}

type MembershipInsert = {
  userId: number;
  membershipTypeId: number;
  membershipStatusId: number;
  startDate?: string;
  endDate?: string;
};

export async function seedMemberships() {
  console.log("Seeding memberships...");

  const csvContent = await fs.readFile(CSV_PATH, "utf-8");
  const rows = parseCsv(csvContent);

  const membershipsToInsert: MembershipInsert[] = rows
    .filter((row) => row.user_id && row.membership_type_id)
    .map((row) => ({
      userId: Number(row.user_id),
      membershipTypeId: Number(row.membership_type_id),
      membershipStatusId: Number(row.membership_status_id),
      startDate: row.startDate || undefined,
    }));

  if (membershipsToInsert.length > 0) {
    await db.insert(memberships).values(membershipsToInsert);
  }

  console.log(`\u2713 Seeded ${membershipsToInsert.length} memberships`);
}

if (require.main === module) {
  seedMemberships()
    .then(() => {
      console.log("Membership seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Membership seeding failed:", error);
      process.exit(1);
    });
}
