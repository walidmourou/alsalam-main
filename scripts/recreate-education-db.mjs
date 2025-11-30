import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function recreateEducationTables() {
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

    // Drop existing tables if they exist
    await connection.execute('DROP TABLE IF EXISTS education_children');
    await connection.execute('DROP TABLE IF EXISTS education_registrations');
    console.log('✓ Existing education tables dropped');

    // Read the updated SQL file
    const educationSql = readFileSync(
      join(__dirname, '..', 'database', 'create_education_tables.sql'),
      'utf-8'
    );

    // Split the SQL into individual statements
    const statements = educationSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement separately
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }

    console.log('✓ Education tables recreated successfully!');

    console.log('\nEducation database recreation completed!');
  } catch (error) {
    console.error('Error recreating education database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

recreateEducationTables();