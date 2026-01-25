# Database Schema Update Summary

## Overview

The project has been updated to use a completely redesigned normalized database schema while keeping MySQL as the database engine.

## Major Changes

### 1. Database Schema Restructure

- **Database Engine**: MySQL (using `mysql2` package)
- **Schema**: Completely redesigned with normalized structure
- Updated all API routes to use the new schema with proper foreign key relationships

### 2. New Database Schema Structure

#### Core Tables

The new schema follows a normalized structure with the following key tables:

**Users System:**

- `users` - Central authentication entity (replaces fragmented membership/education_requester structure)
- `roles` - Role definitions with multilingual support
- `permissions` - Fine-grained access control
- `user_roles` - User-to-role assignments
- `role_permissions` - Role-to-permission assignments
- `auth_tokens` - Passwordless authentication tokens

**Membership System:**

- `memberships` - Linked to users with type and status tracking
- `membership_types` - Membership type definitions
- `membership_statuses` - Status lookup with multilingual labels

**Education System:**

- `students` - Student records (not tied to specific requester)
- `student_guardians` - Many-to-many relationship between students and users (guardians)
- `teachers` - Teacher profiles linked to users
- `classes` - Class definitions with schedules
- `class_students` - Student enrollments in classes
- `class_schedules` - Class timing per day
- `attendance` - Attendance tracking

**Financial System:**

- `incoming` - Revenue tracking
- `purchases` - Expense tracking
- `payments` - General payment transactions

**Lookup Tables (with multilingual support):**

- `genders`
- `marital_statuses`
- `membership_statuses`
- `membership_types`
- `relationship_types`
- `payment_methods`
- `payment_statuses`
- `schedule_days`
- `education_years`
- `education_levels`
- `enrollment_statuses`
- `attendance_statuses`
- `incoming_types`
- `purchase_categories`

### 3. API Routes Updated

All API routes have been updated to use PostgreSQL syntax and the new schema:

#### Membership Routes

- [src/app/api/membership/route.ts](src/app/api/membership/route.ts)
  - Creates user in `users` table
  - Links membership to user via `user_id`
  - Uses lookup tables for gender, marital_status, membership_type, and membership_status
  - Implements transaction support with BEGIN/COMMIT/ROLLBACK

- [src/app/api/membership/confirm/route.ts](src/app/api/membership/confirm/route.ts)
  - Joins `memberships` and `users` tables
  - Updates membership status using status lookup table

#### Education Registration Routes

- [src/app/api/education-registration/route.ts](src/app/api/education-registration/route.ts)
  - Creates or reuses user from `users` table
  - Assigns 'parent' role via `user_roles`
  - Creates students in `students` table
  - Links students to guardian via `student_guardians` table
  - Uses auth_tokens for confirmation instead of dedicated confirmation field

- [src/app/api/education-registration/confirm/route.ts](src/app/api/education-registration/confirm/route.ts)
  - Uses `auth_tokens` table for verification
  - Marks token as used

- [src/app/api/education-registration/students/route.ts](src/app/api/education-registration/students/route.ts)
  - Updated to work with new `students` and `student_guardians` tables
  - Supports adding and removing students

#### Authentication Routes

- [src/app/api/auth/send-magic-link/route.ts](src/app/api/auth/send-magic-link/route.ts)
  - Checks user in `users` table
  - Creates magic link token in `auth_tokens` table

- [src/app/api/auth/profile/route.ts](src/app/api/auth/profile/route.ts)
  - GET: Retrieves user data with joins to memberships, students, and roles
  - PUT: Updates user, membership, and student data separately
  - Uses transaction support

- [src/app/[lang]/auth/verify/route.ts](src/app/[lang]/auth/verify/route.ts)
  - Verifies token from `auth_tokens` table
  - Updates `last_connection_at` in users table

- [src/app/api/auth/cancel/route.ts](src/app/api/auth/cancel/route.ts)
  - Soft deletes memberships or students via `deleted_at` timestamp
  - Uses transactions for data integrity

### 4. Database Connection and Query Patterns

**Connection Pattern:**

```typescript
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();

  // Execute queries
  const [rows] = await connection.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);

  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
```

**Key patterns:**

- Use `pool.getConnection()` for transaction support
- Parameter placeholders: `?` for each parameter
- Result destructuring: `const [rows] = await connection.query(...)`
- Row count: `(result as any).affectedRows`
- Insert ID: `(result as any).insertId`
- Transactions: `beginTransaction()`, `commit()`, `rollback()`

### 5. Package Dependencies

**Remains in package.json:**

```json
{
  "dependencies": {
    "mysql2": "^3.11.5"
  }
}
```

No changes to dependencies - still using MySQL.

## Installation Steps

1. **Install new dependencies:**

   ````bash
   npm instaldependencies:**
   ```bash
   npm install
   ````

2. **Update environment variables:**
   - Copy `.env.example` to `.env.local`
   - Update database connection settings for MySQL:
     ```
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=alsalam
     DB_PASSWORD=your_password
     DB_NAME=alsalam_db
     ```

3. **Set up the database:**
   - Note: The SQL files in `database/` folder use PostgreSQL syntax and need to be converted to MySQL syntax before execution
   - Convert `SERIAL` to `INT AUTO_INCREMENT`
   - Convert `ON CONFLICT (code) DO NOTHING` to `ON DUPLICATE KEY UPDATE code=code`
   - Then execute the schema files Benefits

4. **Normalized Structure**: Eliminated data duplication, users exist once in `users` table
5. **Better Relationships**: Proper foreign keys and junction tables for many-to-many relationships
6. **Role-Based Access Control**: Flexible RBAC system with roles and permissions
7. **Multilingual Support**: All lookup tables have multilingual labels (DE, AR, FR)
8. **Audit Trail**: Created_at, updated_at, deleted_at times with proper connection management
9. **Scalability**: Normalized schema provides better performance and maintainability
10. **Scalability**: PostgreSQL provides better performance and features for complex queries

## Migration Notes

- All soft-delete functionality preserved using `deleted_at` timestamp
- Confirmation tokens moved to dedicated `auth_tokens` table
- User authentication centralized through `users` table
- SEPA mandate information remains in `memberships` table
- Students can have multiple guardians through `student_guardians` table

## Next Steps

1. Test all registration flows (membership, education)
2. Test authentication flows (magic link, profile management)
3. Verify email sending functionality
4. Test soft-delete and cancellation flows
5. Consider adding database migrations for future schema changes
6. Add indexes for frequently queried columns (already included in schema)
7. Set up database backups
8. Configure connection pooling for production
