import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function dropConsentMediaRecognizable() {
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

    // Drop consent_media_recognizable column from education_registrations table
    const dropQuery = `ALTER TABLE education_registrations DROP COLUMN IF EXISTS consent_media_recognizable`;

    try {
      await connection.execute(dropQuery);
      console.log('✓ consent_media_recognizable column dropped successfully');
    } catch (error) {
      console.log('Error dropping column:', error.message);
    }

    console.log('\nDatabase update completed!');
  } catch (error) {
    console.error('Error updating database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

dropConsentMediaRecognizable();