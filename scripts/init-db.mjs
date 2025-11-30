import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function initDatabase() {
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

    // Drop existing table to recreate with new schema
    await connection.query('DROP TABLE IF EXISTS memberships');
    await connection.query('DROP TABLE IF EXISTS auth_tokens');
    console.log('✓ Dropped existing tables');

    // Read and execute SQL files
    const membershipsSql = readFileSync(
      join(__dirname, '..', 'database', 'create_memberships_table.sql'),
      'utf-8'
    );

    const authTokensSql = readFileSync(
      join(__dirname, '..', 'database', 'create_auth_tokens_table.sql'),
      'utf-8'
    );

    await connection.query(membershipsSql);
    console.log('✓ Memberships table created successfully!');

    await connection.query(authTokensSql);
    console.log('✓ Auth tokens table created successfully!');

    console.log('\nDatabase initialization completed!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
