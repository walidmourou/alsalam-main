import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { db } from "../index";
import { users } from "../schema";

const CSV_PATH = path.join(__dirname, "..", "users.seed.csv");

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

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function sanitizeNameForEmail(value: string) {
  return value
    .trim()
    .replace(/\s+/g, ".")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/\.{2,}/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .toLowerCase();
}

function buildPlaceholderEmail(
  firstName: string,
  lastName: string,
  usedEmails: Set<string>,
) {
  const base = sanitizeNameForEmail(`${firstName}.${lastName}`) || "user";
  let email = `${base}@example.com`;
  let suffix = 1;

  while (usedEmails.has(email)) {
    email = `${base}${suffix}@example.com`;
    suffix += 1;
  }

  usedEmails.add(email);
  return email;
}

type UserInsert = {
  email: string;
  firstName: string;
  lastName: string;
  genderId: number;
  maritalStatusId: number;
  phone?: string;
  phone2?: string;
  address?: string;
};

function hasValue(value: string) {
  return value !== undefined && value !== null && value.trim() !== "";
}

function buildUserRecord(row: Record<string, string>, email: string) {
  const record: UserInsert = {
    email,
    firstName: row.firstName || "",
    lastName: row.lastName || "",
    genderId: Number(row.genderId) || 1,
    maritalStatusId: Number(row.maritalStatusId) || 1,
  };

  if (hasValue(row.phone)) {
    record.phone = row.phone;
  }
  if (hasValue(row.phone2)) {
    record.phone2 = row.phone2;
  }
  if (hasValue(row.address)) {
    record.address = row.address;
  }

  return record;
}

function recordScore(row: Record<string, string>) {
  return ["email", "phone", "phone2", "address", "genderId"].reduce(
    (score, key) => score + (hasValue(row[key]) ? 1 : 0),
    0,
  );
}

export async function seedUsers() {
  console.log("Seeding users...");

  const csvContent = await fs.readFile(CSV_PATH, "utf-8");
  const rows = parseCsv(csvContent);

  const usedEmails = new Set<string>();
  const usersByKey = new Map<string, UserInsert>();

  const keyForRow = (row: Record<string, string>) => {
    const email = normalizeEmail(row.email || "");
    if (email) {
      return `email:${email}`;
    }

    return `name:${row.firstName.trim().toLowerCase()}|${row.lastName.trim().toLowerCase()}`;
  };

  for (const row of rows) {
    if (!row.firstName || !row.lastName) {
      continue;
    }

    const email = normalizeEmail(row.email || "");
    const key = keyForRow(row);
    const hasExplicitEmail = hasValue(row.email);

    const candidate = buildUserRecord(
      row,
      hasExplicitEmail ? email : "",
    );
    const existing = usersByKey.get(key);

    if (!existing) {
      usersByKey.set(key, candidate);
    } else {
      const existingScore = recordScore(
        Object.fromEntries(
          Object.entries(rows.find((r) => keyForRow(r) === key) ?? {}),
        ),
      );
      const candidateScore = recordScore(row);
      if (candidateScore > existingScore) {
        usersByKey.set(key, candidate);
      }
    }

    if (hasExplicitEmail) {
      usedEmails.add(email);
    }
  }

  const usersToInsert: UserInsert[] = [];

  for (const [, user] of usersByKey) {
    if (!user.email) {
      user.email = buildPlaceholderEmail(
        user.firstName,
        user.lastName,
        usedEmails,
      );
    }
    usersToInsert.push(user);
  }

  if (usersToInsert.length > 0) {
    await db.insert(users).values(usersToInsert);
  }

  console.log(`✓ Seeded ${usersToInsert.length} users`);
}

if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log("User seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("User seeding failed:", error);
      process.exit(1);
    });
}
