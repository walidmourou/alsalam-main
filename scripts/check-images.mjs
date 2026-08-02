import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function checkArticles() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('📊 Checking articles with images...\n');

    const [rows] = await connection.query(
      'SELECT id, title_ar, image_url FROM articles ORDER BY id'
    );

    console.log('Articles in database:');
    console.log('====================');
    rows.forEach(row => {
      console.log(`\nID: ${row.id}`);
      console.log(`Title: ${row.title_ar}`);
      console.log(`Image URL: ${row.image_url || 'NULL'}`);
    });

    await connection.end();

  } catch (error) {
    console.error('Error:', error);
  }
}

checkArticles();
