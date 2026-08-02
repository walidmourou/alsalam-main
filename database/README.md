# Database Setup Scripts

This folder contains SQL scripts to set up a fresh, clean database for the AL-SALAM organization management system.

## Quick Start

**Run the master setup script:**

```bash
psql -U alsalam -d alsalam_db -f database/00_master_setup.sql
```

This will create all tables, relationships, indexes, views, and insert default data.

## Files

### Main Setup Script

- **00_master_setup.sql** - Master script that orchestrates the entire setup

### Creation Scripts (executed in order)

1. **01_create_lookup_tables.sql** - Lookup tables with multilingual support (14 tables)
2. **02_create_users_and_roles.sql** - Users table + RBAC system (roles, permissions, etc.)
3. **03_create_memberships_students.sql** - Memberships, students, auth_tokens, articles
4. **04_create_education_tables.sql** - Education system (teachers, classes, attendance)
5. **05_create_financial_tables.sql** - Financial tracking (incoming, purchases, payments)

## What Gets Created

### Core Tables (31 total)

**Authentication & Users:**

- users
- auth_tokens
- roles
- permissions
- user_roles
- role_permissions

**Memberships:**

- memberships
- membership_types
- membership_statuses

**Education:**

- students
- student_guardians
- teachers
- classes
- class_schedules
- class_students
- attendance
- education_years
- education_levels
- enrollment_statuses
- attendance_statuses

**Finance:**

- incoming
- purchases
- payments
- incoming_types
- purchase_categories
- payment_methods
- payment_statuses

**Content:**

- articles

**Lookup Tables:**

- genders
- marital_statuses
- relationship_types
- schedule_days

### Views (10 total)

- vw_user_roles
- vw_active_memberships
- vw_students_with_guardians
- vw_classes_with_details
- vw_class_schedules_with_labels
- vw_student_enrollments
- vw_attendance_summary
- vw_incoming_summary
- vw_purchase_summary
- vw_monthly_financial_overview
- vw_membership_payments

### Default Data

- 7 roles (admin, board_member, treasurer, teacher, member, parent, student)
- 24 permissions across 5 resource areas
- Role-permission mappings
- Lookup table values (genders, statuses, types, days, levels, etc.)

## Database Schema Features

✅ **Central users table** - Single authentication entity  
✅ **RBAC system** - Complete role-based access control  
✅ **Multilingual support** - German, Arabic, French in all lookup tables  
✅ **Proper relationships** - Foreign keys with cascade rules  
✅ **80+ indexes** - Optimized for common queries  
✅ **Soft deletes** - deleted_at column on key tables  
✅ **Audit trail** - created_at, updated_at with triggers  
✅ **Comprehensive views** - Pre-built queries for common operations

## Manual Installation (Step by Step)

If you prefer to run scripts individually:

```bash
# 1. Create lookup tables
psql -U alsalam -d alsalam_db -f database/01_create_lookup_tables.sql

# 2. Create users and roles
psql -U alsalam -d alsalam_db -f database/02_create_users_and_roles.sql

# 3. Create memberships and students
psql -U alsalam -d alsalam_db -f database/03_create_memberships_students.sql

# 4. Create education tables
psql -U alsalam -d alsalam_db -f database/04_create_education_tables.sql

# 5. Create financial tables
psql -U alsalam -d alsalam_db -f database/05_create_financial_tables.sql
```

## Node.js Setup Script

You can also use the Node.js script:

```bash
node scripts/setup-database.mjs
```

This script reads and executes all SQL files in order.

## Verification

After setup, verify the installation:

```sql
-- Check table count
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
-- Should return 31

-- Check view count
SELECT COUNT(*) FROM information_schema.views
WHERE table_schema = 'public';
-- Should return 10+

-- Check roles
SELECT code, name_de FROM roles ORDER BY id;

-- Check permissions
SELECT COUNT(*) FROM permissions;
-- Should return 24

-- Check lookup data
SELECT 'genders' as table_name, COUNT(*) as rows FROM genders
UNION ALL SELECT 'roles', COUNT(*) FROM roles
UNION ALL SELECT 'permissions', COUNT(*) FROM permissions;
```

## Important Notes

- **Fresh Install Only**: These scripts drop existing tables. Do not run on a database with data you want to keep.
- **No Migration**: These scripts do NOT migrate data from old schema. They create a fresh database.
- **Foreign Keys**: All relationships are enforced with foreign key constraints.
- **Cascades**: Most foreign keys use ON DELETE CASCADE for automatic cleanup.
- **Indexes**: All foreign keys and frequently queried fields are indexed.

## Schema Documentation

For detailed schema information, see:

- **DATABASE_IMPLEMENTATION_GUIDE.md** - Complete implementation guide
- **ERD_UPDATE_GUIDE.md** - ERD structure reference
- **data-model-improved.erd** - Visual ERD diagram

## Next Steps

After running the setup:

1. ✅ Database is ready
2. Update application code to use new schema
3. Update API routes to query new tables
4. Test authentication and permissions
5. Verify all features work with new structure

## Troubleshooting

**"relation does not exist" error:**

- Make sure you're running scripts in order
- Check that 00_master_setup.sql ran completely

**Foreign key constraint violation:**

- Ensure lookup tables are created first
- Verify all referenced tables exist

**Permission denied:**

- Check your PostgreSQL user has CREATE privileges
- Verify database ownership

## Contact

For issues or questions about the database schema, refer to the implementation guide or ERD documentation.
