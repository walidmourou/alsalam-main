import "dotenv/config";
import { pool } from "./index";

function escapeIdentifier(name: string) {
  return `\`${name.replace(/`/g, "``")}\``;
}

async function dropAllTables() {
  const database = process.env.DATABASE_NAME;
  if (!database) {
    throw new Error("DATABASE_NAME is not defined in the environment");
  }

  const [rows] = await pool.query<[{ TABLE_NAME: string }]>(
    `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'`,
    [database],
  );

  const tableNames = rows.map((row) => row.TABLE_NAME).filter(Boolean);

  if (tableNames.length === 0) {
    console.log(`No tables found in database '${database}'`);
    return;
  }

  const quotedNames = tableNames.map(escapeIdentifier).join(", ");

  await pool.execute("SET FOREIGN_KEY_CHECKS = 0");
  await pool.execute(`DROP TABLE IF EXISTS ${quotedNames}`);
  await pool.execute("SET FOREIGN_KEY_CHECKS = 1");

  console.log(
    `Dropped ${tableNames.length} tables from database '${database}'`,
  );
}

if (require.main === module) {
  dropAllTables()
    .then(() => {
      console.log("Database cleanup completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed to drop tables:", error);
      process.exit(1);
    });
}
