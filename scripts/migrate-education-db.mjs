import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function migrateEducationTables() {
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

    // Check if old tables exist
    const [oldTables] = await connection.execute(`
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('education_registrations', 'education_children')
    `, [process.env.DB_NAME]);

    if (oldTables.length === 0) {
      console.log('No old education tables found. Creating new schema...');
    } else {
      console.log('Found old education tables. Starting migration...');
    }

    // Create new tables
    console.log('Creating new education tables...');
    const newSchemaSql = readFileSync(
      join(__dirname, '..', 'database', 'create_education_tables.sql'),
      'utf-8'
    );

    const statements = newSchemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }

    console.log('✓ New education tables created successfully!');

    // Migrate data if old tables exist
    if (oldTables.length > 0) {
      console.log('Migrating data from old tables...');

      // Get all registrations
      const [registrations] = await connection.execute('SELECT * FROM education_registrations');

      for (const reg of registrations) {
        // Generate unique education ID for migrated records
        const year = new Date().getFullYear();
        const educationId = `EDU${year}${reg.id.toString().padStart(6, '0')}`;

        // Insert requester with responsible person data
        const [requesterResult] = await connection.execute(
          `INSERT INTO education_requesters (
            education_id, first_name, last_name, address, email, phone,
            responsible_first_name, responsible_last_name, responsible_address,
            responsible_email, responsible_phone,
            consent_date, consent_signature, consent_media_online,
            consent_media_print, consent_media_promotion, school_rules_accepted,
            sepa_account_holder, sepa_iban, sepa_bic, sepa_bank, sepa_mandate,
            lang, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            educationId,
            reg.requester_first_name,
            reg.requester_last_name,
            reg.requester_address,
            reg.requester_email,
            reg.requester_phone,
            reg.responsible_first_name,
            reg.responsible_last_name,
            reg.responsible_address,
            reg.responsible_email,
            reg.responsible_phone,
            reg.consent_date,
            reg.consent_signature,
            reg.consent_media_online,
            reg.consent_media_print,
            reg.consent_media_promotion,
            reg.school_rules_accepted,
            reg.sepa_account_holder,
            reg.sepa_iban,
            reg.sepa_bic,
            reg.sepa_bank,
            reg.sepa_mandate,
            reg.lang,
            reg.status,
            reg.created_at,
            reg.updated_at,
          ]
        );

        const requesterId = requesterResult.insertId;

        // Insert children
        const [children] = await connection.execute(
          'SELECT * FROM education_children WHERE registration_id = ?',
          [reg.id]
        );

        for (const child of children) {
          await connection.execute(
            `INSERT INTO education_students (
              requester_id, first_name, last_name, birth_date, estimated_level
            ) VALUES (?, ?, ?, ?, ?)`,
            [
              requesterId,
              child.first_name,
              child.last_name,
              child.birth_date,
              child.estimated_level,
            ]
          );
        }
      }

      console.log('✓ Data migration completed!');

      // Optional: Backup old tables by renaming them
      console.log('Backing up old tables...');
      await connection.execute('ALTER TABLE education_registrations RENAME TO education_registrations_backup');
      await connection.execute('ALTER TABLE education_children RENAME TO education_children_backup');
      console.log('✓ Old tables backed up as *_backup');
    }

    console.log('\nEducation database migration completed successfully!');
    console.log('New tables: education_requesters (with responsible person fields), education_students');
    console.log('Old tables backed up as: education_registrations_backup, education_children_backup');

  } catch (error) {
    console.error('Error migrating education database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

migrateEducationTables();