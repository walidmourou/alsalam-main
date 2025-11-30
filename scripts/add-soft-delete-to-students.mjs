import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function addSoftDeleteToStudents() {
  let connection;

  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('Connected to database successfully!');

    // Read and execute the soft delete migration SQL
    const softDeleteSql = readFileSync(
      join(__dirname, '..', 'database', 'add_soft_delete_to_students.sql'),
      'utf-8'
    );

    await connection.query(softDeleteSql);
    console.log('✓ Soft delete column added to education_students table successfully!');

    console.log('\nMigration completed!');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addSoftDeleteToStudents();