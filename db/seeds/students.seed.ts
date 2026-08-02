import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { db } from "../index";
import { students, studentGuardians } from "../schema";

const CSV_PATH = path.join(__dirname, "..", "students.csv");

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

function normalizeDate(value: string) {
  const cleaned = value.trim();
  if (!cleaned) {
    return "2000-01-01";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  const match = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return cleaned;
  }

  return "2000-01-01";
}

type StudentInsert = {
  firstName: string;
  lastName: string;
  birthDate: string;
  notes?: string;
  genderId: number;
};

type GuardianInsert = {
  userId: number;
  studentId: number;
  relationshipTypeId: number;
  isPrimary: boolean;
};

export async function seedStudents() {
  console.log("Seeding students...");

  const csvContent = await fs.readFile(CSV_PATH, "utf-8");
  const rows = parseCsv(csvContent);

  const seen = new Set<string>();
  const studentRows: Record<string, string>[] = [];

  for (const row of rows) {
    const lastName = (row.last_name || "").trim();
    const firstName = (row.first_name || "").trim();

    if (!lastName && !firstName) {
      continue;
    }

    const key = `${firstName}|${lastName}|${normalizeDate(row.birth_date || "")}`.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    studentRows.push(row);
  }

  const studentsToInsert: StudentInsert[] = studentRows.map((row) => ({
    firstName: (row.first_name || "").trim(),
    lastName: (row.last_name || "").trim(),
    birthDate: normalizeDate(row.birth_date || ""),
    notes: row.notes || undefined,
    genderId: Number(row.gender_id) || 1,
  }));

  if (studentsToInsert.length > 0) {
    await db.insert(students).values(studentsToInsert);
  }

  console.log(`\u2713 Seeded ${studentsToInsert.length} students`);

  const insertedStudents = await db
    .select({
      id: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      birthDate: students.birthDate,
    })
    .from(students);

  const toDateString = (d: Date | string | null) => {
    if (!d) return "2000-01-01";
    if (typeof d === "string") return d.slice(0, 10);
    return d.toISOString().slice(0, 10);
  };

  const studentMap = new Map<string, number>();
  for (const s of insertedStudents) {
    const key = `${s.firstName}|${s.lastName}|${toDateString(s.birthDate)}`.toLowerCase();
    if (!studentMap.has(key)) {
      studentMap.set(key, s.id);
    }
  }

  const guardiansToInsert: GuardianInsert[] = [];

  for (const row of studentRows) {
    const key = `${(row.first_name || "").trim()}|${(row.last_name || "").trim()}|${normalizeDate(row.birth_date || "")}`.toLowerCase();
    const studentId = studentMap.get(key);
    if (!studentId) {
      continue;
    }

    if (row.primary_gradian_user_id) {
      guardiansToInsert.push({
        userId: Number(row.primary_gradian_user_id),
        studentId,
        relationshipTypeId: Number(row.primary_gradian_relationship_id) || 1,
        isPrimary: true,
      });
    }

    if (row.second_gradian_user_id) {
      guardiansToInsert.push({
        userId: Number(row.second_gradian_user_id),
        studentId,
        relationshipTypeId: Number(row.gradian_relationship_id) || 2,
        isPrimary: false,
      });
    }
  }

  if (guardiansToInsert.length > 0) {
    await db.insert(studentGuardians).values(guardiansToInsert);
  }

  console.log(`\u2713 Seeded ${guardiansToInsert.length} student guardians`);
}

if (require.main === module) {
  seedStudents()
    .then(() => {
      console.log("Student seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Student seeding failed:", error);
      process.exit(1);
    });
}
