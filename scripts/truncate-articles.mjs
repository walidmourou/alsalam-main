import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function truncateAndReload() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('Connected to database successfully!\n');

    // Truncate the articles table
    console.log('🗑️  Truncating articles table...');
    await connection.query('TRUNCATE TABLE articles');
    console.log('✅ Articles table truncated successfully!\n');

    await connection.end();
    console.log('✅ Ready to insert new articles. Running insert script...\n');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

truncateAndReload();
