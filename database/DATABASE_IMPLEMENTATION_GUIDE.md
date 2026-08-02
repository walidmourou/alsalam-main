# Database Schema Implementation Guide

## Overview

This guide documents the complete database schema implementation for the AL-SALAM organization management system. The schema provides a robust, normalized, and scalable database design with comprehensive role-based access control, multilingual support, and proper relationships.

**Note:** This is a fresh installation guide. The database scripts create a new, clean database from scratch without any data migration.

## What Was Implemented

### 1. **Lookup Tables with Multilingual Support** ✅

- `genders` - Gender options (male, female, other)
- `marital_statuses` - Marital status options
- `membership_statuses` - Membership workflow states
- `membership_types` - Types of memberships (individual, family, student, senior, honorary)
- `relationship_types` - Student-guardian relationships (mother, father, guardian, other)
- `payment_methods` - Payment options (SEPA, bank transfer, cash, card)
- `payment_statuses` - Payment states (pending, completed, failed, refunded)
- `schedule_days` - Days of the week with ordering
- `education_years` - Academic years with current year tracking
- `education_levels` - Education levels (preparatory, level1-4)
- `enrollment_statuses` - Enrollment states (enrolled, waitlist, withdrawn, completed)
- `attendance_statuses` - Attendance states (present, absent, excused, late)
- `incoming_types` - Revenue categories (donation, membership_fee, education_fee, etc.)
- `purchase_categories` - Expense categories (supplies, utilities, maintenance, etc.)

All lookup tables include German, Arabic, and French labels for full multilingual support.

### 2. **Central Users Table** ✅

Created `users` table as the central authentication and profile entity:

- Replaces fragmented membership/education_requester structure
- Links to all other entities (memberships, students, teachers, payments)
- Includes soft delete support
- Proper foreign keys to lookup tables (gender_id, marital_status_id)

### 3. **Role-Based Access Control (RBAC)** ✅

Comprehensive permission system:

- **`roles` table** - Role definitions (admin, board_member, treasurer, teacher, member, parent, student)
- **`permissions` table** - Fine-grained permissions (users.view, memberships.approve, finance.manage, etc.)
- **`user_roles` table** - User-role assignments with expiration support
- **`role_permissions` table** - Maps permissions to roles
- **`vw_user_roles` view** - Easy access to user permissions

Pre-configured with 24 permissions across 5 resource areas.

### 4. **Restructured Memberships** ✅

New `memberships_new` table:

- Links to `users` table (many users can have membership history)
- Links to `membership_types` and `membership_statuses` lookup tables
- Supports SEPA payment information
- Includes start_date, end_date, annual_fee tracking
- Confirmation token workflow maintained

### 5. **Proper Student-Guardian Relationships** ✅

Fixed the student model:

- **`students` table** - Student records (independent of users)
- **`student_guardians` table** - Many-to-many junction between students and users (guardians)
- Supports multiple guardians per student
- Tracks relationship type, primary guardian, pickup authorization

### 6. **Comprehensive Education System** ✅

- **`teachers` table** - Linked to users, tracks qualifications
- **`classes` table** - Education classes with teacher, year, level
- **`class_schedules` table** - Junction table supporting multiple days per week (fixes single-day limitation)
- **`class_students` table** - Enrollment tracking with status
- **`attendance` table** - Daily attendance with status tracking

### 7. **Complete Financial System** ✅

- **`incoming` table** - Revenue tracking (donations, fees, etc.)
- **`purchases` table** - Expense tracking with invoice details
- **`payments` table** - Payment transactions linked to users/memberships

### 8. **Comprehensive Indexing** ✅

Added indexes on:

- All foreign keys
- Email fields
- Date fields
- Status/code fields
- Frequently queried columns

Total: 80+ indexes across all tables.

### 9. **Useful Views** ✅

Created 10+ views for common queries:

- `vw_user_roles` - Users with their roles and permissions
- `vw_active_memberships` - Active membership details
- `vw_students_with_guardians` - Student-guardian relationships
- `vw_classes_with_details` - Classes with teacher and enrollment count
- `vw_student_enrollments` - Enrollment details
- `vw_attendance_summary` - Attendance statistics by month
- `vw_incoming_summary` - Revenue by type and month
- `vw_purchase_summary` - Expenses by category and month
- `vw_monthly_financial_overview` - Income vs expenses overview
- `vw_membership_payments` - Payment history

### 10. **Data Migration Script** ✅

Automated migration from old schema:

- Migrates memberships → users + memberships_new
- Migrates education_requesters → users with 'parent' role
- Migrates education_students → students + student_guardians
- Assigns appropriate roles to all users
- Creates default education year

## Installation Instructions

### Option 1: Complete Fresh Install

```bash
# Connect to your PostgreSQL database
psql -U alsalam -d alsalam_db

# Run the master setup script
\i database/00_master_setup.sql
```

This will execute all scripts in order:

1. Lookup tables
2. Users and roles
3. Memberships and students
4. Education tables
5. Financial tables
6. Data migration

### Manual Installation (Step by Step)

```bash
# 1. Create lookup tables
psql -U alsalam -d alsalam_db -f database/01_create_lookup_tables.sql

# 2. Create users and roles
psql -U alsalam -d alsalam_db -f database/02_create_users_and_roles.sql

# 3. Create memberships, students, articles
psql -U alsalam -d alsalam_db -f database/03_create_memberships_students.sql

# 4. Create education tables
psql -U alsalam -d alsalam_db -f database/04_create_education_tables.sql

# 5. Create financial tables
psql -U alsalam -d alsalam_db -f database/05_create_financial_tables.sql
```

### Option 3: Node.js Script (Recommended for Development)

Create a setup script in `scripts/`:

```javascript
// scripts/setup-improved-db.mjs
import { Client } from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Client({
  connectionString: process.env.CONN_URL,
});

async function setup() {
  try {
    await client.connect();
    console.log("Connected to database\n");

    const scripts = [
      "01_create_lookup_tables.sql",
      "02_create_users_and_roles.sql",
      "03_restructure_memberships_students.sql",
      "04_create_education_tables.sql",
      "05_create_financial_tables.sql",
      "06_migrate_existing_data.sql",
    ];

    for (const script of scripts) {
      console.log(`Executing ${script}...`);
      const sql = readFileSync(
        join(__dirname, "..", "database", script),
        "utf-8",
      );
      await client.query(sql);
      console.log(`✓ ${script} completed\n`);
    }

    console.log("✓ Database setup completed successfully!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.end();
  }
}

setup();
```

Run with:

```bash
node scripts/setup-improved-db.mjs
```

## Verification

After installation, verify the setup:

```sql
-- Check table counts
SELECT
    schemaname,
    COUNT(*) as table_count
FROM pg_tables
WHERE schemaname = 'public'
GROUP BY schemaname;

-- Check migrated users
SELECT COUNT(*) as total_users FROM users;

-- Check user roles
SELECT role_code, COUNT(*) as user_count
FROM user_roles
GROUP BY role_code;

-- Check active memberships
SELECT COUNT(*) FROM vw_active_memberships;

-- Check students with guardians
SELECT COUNT(*) FROM vw_students_with_guardians;

-- Check lookup table data
SELECT 'genders' as table_name, COUNT(*) as rows FROM genders
UNION ALL
SELECT 'marital_statuses', COUNT(*) FROM marital_statuses
UNION ALL
SELECT 'membership_types', COUNT(*) FROM membership_types
UNION ALL
SELECT 'roles', COUNT(*) FROM roles
UNION ALL
SELECT 'permissions', COUNT(*) FROM permissions;
```

## Next Steps

### 1. Update Application Code

The new schema requires updates to your application code:

#### Update Database Queries

**Old:**

```typescript
// Old membership query
const result = await pool.query("SELECT * FROM memberships WHERE email = $1", [
  email,
]);
```

**New:**

```typescript
// New query using users + memberships
const result = await pool.query(
  `
  SELECT u.*, m.membership_id, m.annual_fee, mt.name as membership_type
  FROM users u
  JOIN memberships_new m ON u.id = m.user_id
  JOIN membership_types mt ON m.membership_type_id = mt.id
  WHERE u.email = $1 AND u.deleted_at IS NULL
`,
  [email],
);

// Or use the view
const result = await pool.query(
  `
  SELECT * FROM vw_active_memberships WHERE email = $1
`,
  [email],
);
```

#### Check User Permissions

```typescript
// Check if user has permission
async function hasPermission(email: string, permissionCode: string) {
  const result = await pool.query(
    `
    SELECT 1 FROM vw_user_roles
    WHERE email = $1 AND $2 = ANY(permissions)
  `,
    [email, permissionCode],
  );

  return result.rows.length > 0;
}

// Check if user has role
async function hasRole(email: string, roleCode: string) {
  const result = await pool.query(
    `
    SELECT 1 FROM vw_user_roles
    WHERE email = $1 AND $2 = ANY(roles)
  `,
    [email, roleCode],
  );

  return result.rows.length > 0;
}
```

### 2. Update API Routes

Update routes to use new schema:

- `/api/auth/profile/route.ts` - Use `users` and `vw_user_roles`
- `/api/membership/route.ts` - Use `memberships_new` and lookup tables
- `/api/education-registration/route.ts` - Use `students` and `student_guardians`

### 3. Testing

Run comprehensive tests:

- User authentication flow
- Membership registration
- Education registration
- Permission checks
- Financial tracking

### 4. Populate Initial Data

Add your first admin user:

```sql
-- Insert admin user
INSERT INTO users (email, first_name, last_name, is_active)
VALUES ('admin@alsalam.de', 'Admin', 'User', TRUE);

-- Assign admin role
INSERT INTO user_roles (user_id, role_code)
SELECT id, 'admin' FROM users WHERE email = 'admin@alsalam.de';
```

## Key Improvements Summary

| Issue                        | Solution                                        | Status |
| ---------------------------- | ----------------------------------------------- | ------ |
| No central users table       | Created `users` table as central entity         | ✅     |
| Missing role system          | Implemented RBAC with roles & permissions       | ✅     |
| No indexes                   | Added 80+ indexes on all key fields             | ✅     |
| Students not linked to users | Created `student_guardians` junction table      | ✅     |
| Single day per class         | Created `class_schedules` for multiple days     | ✅     |
| No multilingual support      | All lookup tables have DE/AR/FR labels          | ✅     |
| Financial model unclear      | Separated incoming/purchases/payments clearly   | ✅     |
| No data constraints          | Added foreign keys, unique constraints, indexes | ✅     |
| Missing relationships        | Fixed all ERD relationships with proper FKs     | ✅     |
| No useful views              | Created 10+ views for common queries            | ✅     |

## Support

For questions or issues:

1. Check verification queries above
2. Review migration logs
3. Test views with sample queries
4. Verify foreign key constraints

## Database Diagram

The improved schema follows this structure:

```
users (central)
├── user_roles → roles → permissions
├── memberships_new → membership_types/statuses
├── student_guardians → students
├── teachers → classes → class_schedules
│                    └── class_students → students
│                    └── attendance → students
├── incoming → incoming_types
├── purchases → purchase_categories
└── payments → memberships

All tables link to appropriate lookup tables (genders, marital_statuses, etc.)
```

## Performance Considerations

- All foreign keys indexed
- Views use efficient joins
- Soft deletes (deleted_at) indexed
- Date fields indexed for time-based queries
- Composite unique constraints prevent duplicates
- Updated_at triggers for audit trail

## Conclusion

This implementation transforms the database from a simple flat structure into a robust, normalized, enterprise-grade schema with proper relationships, permissions, multilingual support, and comprehensive tracking capabilities.
