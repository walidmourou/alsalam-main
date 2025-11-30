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

    console.log('Checking articles in database...\n');

    const [rows] = await connection.execute(
      'SELECT id, title_ar, title_de, title_fr, status, DATE(published_at) as published_date FROM articles ORDER BY id'
    );

    console.log(`Found ${rows.length} articles:\n`);

    rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.title_ar}`);
      console.log(`   German: ${row.title_de}`);
      console.log(`   French: ${row.title_fr}`);
      console.log(`   Status: ${row.status}`);
      console.log(`   Published: ${row.published_date}\n`);
    });

  } catch (error) {
    console.error('Error checking articles:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkArticles();