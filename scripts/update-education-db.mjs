import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function updateEducationDatabase() {
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

    // Add consent columns to education_registrations table
    const alterQueries = [
      `ALTER TABLE education_registrations ADD COLUMN IF NOT EXISTS consent_children JSON`,
      `ALTER TABLE education_registrations ADD COLUMN IF NOT EXISTS consent_discussed BOOLEAN NOT NULL DEFAULT FALSE`,
      `ALTER TABLE education_registrations ADD COLUMN IF NOT EXISTS consent_informed BOOLEAN NOT NULL DEFAULT FALSE`,
      `ALTER TABLE education_registrations ADD COLUMN IF NOT EXISTS consent_gdpr BOOLEAN NOT NULL DEFAULT FALSE`,
      `ALTER TABLE education_registrations ADD COLUMN IF NOT EXISTS consent_date DATE`,
      `ALTER TABLE education_registrations ADD COLUMN IF NOT EXISTS consent_signature VARCHAR(255)`,
    ];

    for (const query of alterQueries) {
      try {
        await connection.execute(query);
        console.log('✓ Column added successfully');
      } catch (error) {
        console.log('Column might already exist or error:', error.message);
      }
    }

    console.log('\nEducation database update completed!');
  } catch (error) {
    console.error('Error updating education database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateEducationDatabase();