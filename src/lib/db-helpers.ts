// src/lib/db-helpers.ts
import type { PoolConnection } from "mysql2/promise";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";

interface IdRow extends RowDataPacket {
  id: number;
}

const LOOKUP_TABLES = new Set([
  "membership_statuses",
  "membership_types",
  "relationship_types",
]);

// The new Drizzle schema defines lookup tables without seed data. Routes use
// this helper to resolve a label to its id, inserting the row on first use.
export async function getOrCreateLookupId(
  connection: PoolConnection,
  table: string,
  label: string,
): Promise<number> {
  if (!LOOKUP_TABLES.has(table)) {
    throw new Error(`Invalid lookup table: ${table}`);
  }

  const [rows] = await connection.query<IdRow[]>(
    `SELECT id FROM ${table} WHERE label = ? LIMIT 1`,
    [label],
  );

  if (rows.length > 0) {
    return rows[0].id;
  }

  const [result] = await connection.query<ResultSetHeader>(
    `INSERT INTO ${table} (label) VALUES (?)`,
    [label],
  );

  return result.insertId;
}