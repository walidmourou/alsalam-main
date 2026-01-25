-- Master Setup Script for Fresh Installation
-- Run this script to set up the complete database schema from scratch
-- This creates a clean, normalized database with proper relationships
-- Prerequisites:
-- 1. PostgreSQL 12 or higher
-- 2. Database created: alsalam_db
-- 3. Connection configured in .env.local
-- Instructions:
-- Execute this file: psql -U alsalam -d alsalam_db -f database/00_master_setup.sql
\ echo '═══════════════════════════════════════════════════════' \ echo 'AL-SALAM Database Setup - Complete Schema' \ echo '═══════════════════════════════════════════════════════' \ echo '' -- Drop existing tables if they exist (for clean reinstall)
\ echo 'Dropping existing tables if present...' DROP TABLE IF EXISTS auth_tokens CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS class_students CASCADE;
DROP TABLE IF EXISTS class_schedules CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS student_guardians CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS incoming CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS attendance_statuses CASCADE;
DROP TABLE IF EXISTS enrollment_statuses CASCADE;
DROP TABLE IF EXISTS schedule_days CASCADE;
DROP TABLE IF EXISTS education_levels CASCADE;
DROP TABLE IF EXISTS education_years CASCADE;
DROP TABLE IF EXISTS payment_statuses CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS relationship_types CASCADE;
DROP TABLE IF EXISTS membership_statuses CASCADE;
DROP TABLE IF EXISTS membership_types CASCADE;
DROP TABLE IF EXISTS marital_statuses CASCADE;
DROP TABLE IF EXISTS genders CASCADE;
DROP TABLE IF EXISTS incoming_types CASCADE;
DROP TABLE IF EXISTS purchase_categories CASCADE;
\ echo '✓ Existing tables dropped' \ echo '' -- Ensure update trigger function exists
\ echo 'Creating trigger function...'
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';
\ echo '✓ Trigger function created' \ echo '' \ echo 'Step 1: Creating lookup tables...' \ i database / 01_create_lookup_tables.sql \ echo '✓ Lookup tables created' \ echo '' \ echo 'Step 2: Creating users and roles system...' \ i database / 02_create_users_and_roles.sql \ echo '✓ Users and roles created' \ echo '' \ echo 'Step 3: Creating memberships, students, and articles...' \ i database / 03_create_memberships_students.sql \ echo '✓ Memberships and students created' \ echo '' \ echo 'Step 4: Creating education system tables...' \ i database / 04_create_education_tables.sql \ echo '✓ Education tables created' \ echo '' \ echo 'Step 5: Creating financial tracking tables...' \ i database / 05_create_financial_tables.sql \ echo '✓ Financial tables created' \ echo '' \ echo '═══════════════════════════════════════════════════════' \ echo '✓ Database setup completed successfully!' \ echo '═══════════════════════════════════════════════════════' \ echo '' \ echo 'Tables created:' \ echo '  • users (central authentication)' \ echo '  • roles, permissions, user_roles, role_permissions (RBAC)' \ echo '  • memberships (linked to users)' \ echo '  • students, student_guardians' \ echo '  • teachers, classes, class_schedules' \ echo '  • class_students, attendance' \ echo '  • incoming, purchases, payments' \ echo '  • auth_tokens (passwordless auth)' \ echo '  • articles (multilingual content)' \ echo '  • All lookup tables with multilingual support' \ echo '' \ echo 'Views created:' \ echo '  • vw_user_roles' \ echo '  • vw_active_memberships' \ echo '  • vw_students_with_guardians' \ echo '  • vw_classes_with_details' \ echo '  • vw_student_enrollments' \ echo '  • vw_attendance_summary' \ echo '  • vw_monthly_financial_overview' \ echo '  • vw_incoming_summary' \ echo '  • vw_purchase_summary' \ echo '  • vw_membership_payments' \ echo '' \ echo 'Default data inserted:' \ echo '  • 7 roles (admin, board_member, treasurer, teacher, member, parent, student)' \ echo '  • 24 permissions across 5 resource areas' \ echo '  • All role-permission assignments' \ echo '  • Lookup table values (genders, statuses, types, etc.)' \ echo '' \ echo 'Database is ready to use!' \ echo 'Next step: Update your application code to use the new schema' \ echo ''