import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function addMembershipIdColumn() {
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

    // Check if membership_id column already exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'memberships' AND COLUMN_NAME = 'membership_id'
    `, [process.env.DB_NAME]);

    if (columns.length > 0) {
      console.log('membership_id column already exists.');
      return;
    }

    console.log('Adding membership_id column to memberships table...');

    // Add the membership_id column
    await connection.execute(`
      ALTER TABLE memberships
      ADD COLUMN membership_id VARCHAR(50) UNIQUE AFTER id
    `);

    console.log('✓ Added membership_id column');

    // Generate membership IDs for existing records
    const [existingMembers] = await connection.execute(`
      SELECT id FROM memberships WHERE membership_id IS NULL
    `);

    if (existingMembers.length > 0) {
      console.log(`Generating membership IDs for ${existingMembers.length} existing records...`);

      for (const member of existingMembers) {
        const year = new Date().getFullYear();
        const membershipId = `MEM${year}${member.id.toString().padStart(6, '0')}`;

        await connection.execute(`
          UPDATE memberships
          SET membership_id = ?
          WHERE id = ?
        `, [membershipId, member.id]);
      }

      console.log('✓ Generated membership IDs for existing records');
    }

    console.log('\nMembership ID column addition completed successfully!');

  } catch (error) {
    console.error('Error adding membership_id column:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addMembershipIdColumn();