import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { eq } from "drizzle-orm";
import { db } from "../index";
import { teachers, users } from "../schema";

const CSV_PATH = path.join(__dirname, "..", "teachers.csv");

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
      const cleanHeader = header.replace(/"/g, "").trim();
      record[cleanHeader] = values[index] ? values[index].trim() : "";
    });

    return record;
  });
}

function sanitizeEmailBase(value: string) {
  return value
    .trim()
    .replace(/\s+/g, ".")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/\.{2,}/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .toLowerCase();
}

export async function seedTeachers() {
  console.log("Seeding teachers...");

  const csvContent = await fs.readFile(CSV_PATH, "utf-8");
  const rows = parseCsv(csvContent);

  let insertedCount = 0;
  let skippedCount = 0;
  let userCreatedCount = 0;

  for (const row of rows) {
    let email = (row.email || "").trim().toLowerCase();
    const firstName = (row.first_name || "").trim();
    const lastName = (row.last_name || "").trim();
    const birthDate = (row.birth_date || "").trim();
    const phone = (row.phone || "").trim();
    const address = (row[Object.keys(row)[3]] || "").trim();

    if (!firstName && !lastName) {
      skippedCount += 1;
      continue;
    }

    if (!email) {
      const base = sanitizeEmailBase(`${firstName}.${lastName}`) || "teacher";
      email = `${base}@example.com`;
    }

    let userId: number;

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!existingUser) {
      const [result] = await db.insert(users).values({
        email,
        firstName,
        lastName,
        genderId: 1,
        maritalStatusId: 1,
        phone: phone || undefined,
        address: address || undefined,
      });
      userId = Number(result.insertId);
      userCreatedCount += 1;
      console.log(`  Created user #${userId} for ${firstName} ${lastName} <${email}>`);
    } else {
      userId = existingUser.id;
    }

    const [existingTeacher] = await db
      .select({ id: teachers.id })
      .from(teachers)
      .where(eq(teachers.userId, userId))
      .limit(1);

    if (existingTeacher) {
      skippedCount += 1;
      continue;
    }

    await db.insert(teachers).values({
      userId,
      specialization: "",
      qualifications: "",
    });

    insertedCount += 1;
  }

  console.log(`\u2713 Seeded ${insertedCount} teachers (${userCreatedCount} users created, ${skippedCount} skipped)`);
}

if (require.main === module) {
  seedTeachers()
    .then(() => {
      console.log("Teacher seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Teacher seeding failed:", error);
      process.exit(1);
    });
}
