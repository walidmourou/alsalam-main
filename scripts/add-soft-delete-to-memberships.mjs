import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function addSoftDeleteToMemberships() {
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

    // Execute each ALTER statement separately
    await connection.query('ALTER TABLE memberships ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL');
    console.log('✓ Added deleted_at column to memberships table');

    await connection.query('ALTER TABLE memberships ADD INDEX idx_deleted_at (deleted_at)');
    console.log('✓ Added index for deleted_at column');

    await connection.query("ALTER TABLE memberships MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'active', 'inactive', 'cancelled') NOT NULL DEFAULT 'pending'");
    console.log('✓ Updated status enum to include cancelled');

    console.log('✓ Soft delete column and status update added to memberships table successfully!');

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

addSoftDeleteToMemberships();