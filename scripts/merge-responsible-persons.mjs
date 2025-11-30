import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function mergeResponsiblePersons() {
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

    // Check if education_responsible_persons table exists
    const [responsibleTable] = await connection.execute(`
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'education_responsible_persons'
    `, [process.env.DB_NAME]);

    if (responsibleTable.length === 0) {
      console.log('No education_responsible_persons table found. Nothing to merge.');
      return;
    }

    console.log('Found education_responsible_persons table. Starting merge...');

    // Check if education_requesters table has the responsible person columns
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'education_requesters' AND COLUMN_NAME LIKE 'responsible_%'
    `, [process.env.DB_NAME]);

    if (columns.length === 0) {
      console.log('Adding responsible person columns to education_requesters table...');

      // Add responsible person columns to education_requesters
      await connection.execute(`
        ALTER TABLE education_requesters
        ADD COLUMN responsible_first_name VARCHAR(100),
        ADD COLUMN responsible_last_name VARCHAR(100),
        ADD COLUMN responsible_address TEXT,
        ADD COLUMN responsible_email VARCHAR(255),
        ADD COLUMN responsible_phone VARCHAR(50)
      `);

      console.log('✓ Added responsible person columns to education_requesters');
    }

    // Get all responsible persons and merge them into requesters
    const [responsiblePersons] = await connection.execute(`
      SELECT requester_id, first_name, last_name, address, email, phone
      FROM education_responsible_persons
    `);

    for (const person of responsiblePersons) {
      await connection.execute(`
        UPDATE education_requesters
        SET
          responsible_first_name = ?,
          responsible_last_name = ?,
          responsible_address = ?,
          responsible_email = ?,
          responsible_phone = ?
        WHERE id = ?
      `, [
        person.first_name,
        person.last_name,
        person.address,
        person.email,
        person.phone,
        person.requester_id
      ]);
    }

    console.log(`✓ Merged ${responsiblePersons.length} responsible persons into education_requesters`);

    // Drop the education_responsible_persons table
    await connection.execute('DROP TABLE education_responsible_persons');
    console.log('✓ Dropped education_responsible_persons table');

    console.log('\nResponsible persons merge completed successfully!');

  } catch (error) {
    console.error('Error merging responsible persons:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

mergeResponsiblePersons();