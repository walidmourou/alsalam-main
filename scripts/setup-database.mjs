import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function initializeDatabase() {
  const client = new Client({
    connectionString: process.env.CONN_URL,
  });

  try {
    await client.connect();
    console.log('✓ Connected to database successfully!\n');

    // Step 1: Drop existing tables
    console.log('Step 1: Dropping existing tables...');
    await client.query('DROP TABLE IF EXISTS education_students CASCADE');
    await client.query('DROP TABLE IF EXISTS education_requesters CASCADE');
    await client.query('DROP TABLE IF EXISTS memberships CASCADE');
    await client.query('DROP TABLE IF EXISTS auth_tokens CASCADE');
    await client.query('DROP TABLE IF EXISTS articles CASCADE');
    console.log('✓ Dropped all existing tables\n');

    // Step 2: Create memberships table
    console.log('Step 2: Creating memberships table...');
    const membershipsSql = readFileSync(
      join(__dirname, '..', 'database', 'create_memberships_table.sql'),
      'utf-8'
    );
    await client.query(membershipsSql);
    console.log('✓ Memberships table created\n');

    // Step 3: Create auth_tokens table
    console.log('Step 3: Creating auth_tokens table...');
    const authTokensSql = readFileSync(
      join(__dirname, '..', 'database', 'create_auth_tokens_table.sql'),
      'utf-8'
    );
    await client.query(authTokensSql);
    console.log('✓ Auth tokens table created\n');

    // Step 4: Create articles table
    console.log('Step 4: Creating articles table...');
    const articlesSql = readFileSync(
      join(__dirname, '..', 'database', 'create_articles_table.sql'),
      'utf-8'
    );
    await client.query(articlesSql);
    console.log('✓ Articles table created\n');

    // Step 5: Create education tables
    console.log('Step 5: Creating education tables...');
    const educationSql = readFileSync(
      join(__dirname, '..', 'database', 'create_education_tables.sql'),
      'utf-8'
    );
    await client.query(educationSql);
    console.log('✓ Education tables created\n');

    // Step 6: Add soft delete columns
    console.log('Step 6: Adding soft delete columns...');
    
    // Add to memberships
    const softDeleteMembershipsSql = readFileSync(
      join(__dirname, '..', 'database', 'add_soft_delete_to_memberships.sql'),
      'utf-8'
    );
    await client.query(softDeleteMembershipsSql);
    console.log('  ✓ Soft delete added to memberships');

    // Add to education_requesters
    const softDeleteRequestersSql = readFileSync(
      join(__dirname, '..', 'database', 'add_soft_delete_to_education_requesters.sql'),
      'utf-8'
    );
    await client.query(softDeleteRequestersSql);
    console.log('  ✓ Soft delete added to education_requesters');

    // Add to education_students
    const softDeleteStudentsSql = readFileSync(
      join(__dirname, '..', 'database', 'add_soft_delete_to_students.sql'),
      'utf-8'
    );
    await client.query(softDeleteStudentsSql);
    console.log('  ✓ Soft delete added to education_students\n');

    // Step 7: Create update triggers
    console.log('Step 7: Creating automatic update triggers...');
    const triggersSql = readFileSync(
      join(__dirname, '..', 'database', 'create_update_triggers.sql'),
      'utf-8'
    );
    await client.query(triggersSql);
    console.log('✓ Update triggers created\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('✓ Database initialization completed successfully!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\nTables created:');
    console.log('  • memberships (with soft delete & triggers)');
    console.log('  • auth_tokens');
    console.log('  • articles (with triggers)');
    console.log('  • education_requesters (with soft delete & triggers)');
    console.log('  • education_students (with soft delete)');
    console.log('\nYour database is ready to use!');

  } catch (error) {
    console.error('\n❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initializeDatabase();
