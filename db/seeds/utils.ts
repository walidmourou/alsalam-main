import { db } from "../index";

export async function insertMissingByUniqueKey(
  table: any,
  uniqueKey: string,
  values: Record<string, unknown>[],
) {
  const existingRows = await db
    .select({ [uniqueKey]: table[uniqueKey] })
    .from(table);
  const existingKeys = new Set(
    existingRows.map((row) => row[uniqueKey] as string),
  );
  const valuesToInsert = values.filter(
    (row) => !existingKeys.has(row[uniqueKey] as string),
  );

  if (valuesToInsert.length > 0) {
    await db.insert(table).values(valuesToInsert);
  }
}

export async function ensureRowCount(table: any, expectedCount: number) {
  const rows = await db.select().from(table).orderBy(table.id);
  const missingCount = expectedCount - rows.length;

  if (missingCount > 0) {
    await db.insert(table).values(Array(missingCount).fill({}));
    return db.select().from(table).orderBy(table.id);
  }

  return rows;
}

export async function insertMissingByCompositeKey(
  table: any,
  uniqueKeys: string[],
  values: Record<string, unknown>[],
) {
  const selection = uniqueKeys.reduce(
    (acc, key) => ({ ...acc, [key]: table[key] }),
    {} as Record<string, unknown>,
  );

  const existingRows = await db.select(selection).from(table);
  const existingKeys = new Set(
    existingRows.map((row) => uniqueKeys.map((key) => row[key]).join("|")),
  );

  const valuesToInsert = values.filter((row) => {
    const rowKey = uniqueKeys.map((key) => row[key]).join("|");
    return !existingKeys.has(rowKey);
  });

  if (valuesToInsert.length > 0) {
    await db.insert(table).values(valuesToInsert);
  }
}
