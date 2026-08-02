# PostgreSQL Migration Guide

This project has been migrated from MySQL to PostgreSQL. This document outlines the changes made and how to set up the database.

## Changes Made

### 1. Dependencies

- **Removed**: `mysql2`
- **Added**: `pg` (PostgreSQL client)
- **Added**: `@types/pg` (TypeScript types)

### 2. Database Connection (`src/lib/db.ts`)

- Changed from MySQL connection pool to PostgreSQL Pool
- Default port changed from 3306 to 5432
- Pool configuration adapted for PostgreSQL

### 3. SQL Schema Changes

All SQL files in `database/` folder have been converted:

- `AUTO_INCREMENT` → `SERIAL`
- `ENUM('value1', 'value2')` → `VARCHAR(n) CHECK (column IN ('value1', 'value2'))`
- `ENGINE = InnoDB` → removed
- `CHARSET` and `COLLATE` → removed
- `INDEX idx_name (column)` → `CREATE INDEX idx_name ON table(column)`
- `LONGTEXT` → `TEXT`
- `ON UPDATE CURRENT_TIMESTAMP` → removed (use triggers if needed)

### 4. API Routes Query Changes

All API routes have been updated:

- `pool.execute()` and `pool.query()` → `pool.query()` (pg uses query for everything)
- Placeholder `?` → `$1, $2, $3, ...` (PostgreSQL positional parameters)
- `pool.getConnection()` → removed (pg handles connections automatically)
- Result destructuring: `const [rows] = await pool.query()` → `const result = await pool.query(); result.rows`
- `result.affectedRows` → `result.rowCount`
- `result.insertId` → use `RETURNING id` in INSERT statements
- `NOW()` → `CURRENT_TIMESTAMP`
- `ON DUPLICATE KEY UPDATE` → `ON CONFLICT ... DO UPDATE`

### 5. Initialization Scripts

Updated all `.mjs` scripts in `scripts/` folder:

- Changed from `mysql2/promise` to `pg`
- Updated connection creation
- Updated query syntax

## Database Setup

### Prerequisites

- PostgreSQL 12 or higher installed
- Database created with name matching `.env.local` configuration

### Environment Variables

Update your `.env.local` file:

```env
DB_HOST=168.231.117.70
DB_PORT=5432
DB_USER=alsalam
DB_PASSWORD=your_password
DB_NAME=alsalam
```

### Initialize Database

1. **Create all tables:**

```bash
node scripts/init-db.mjs
```

2. **Create education tables:**

```bash
node scripts/init-education-db.mjs
```

3. **Add soft delete columns (if needed):**

```bash
node scripts/add-soft-delete-to-memberships.mjs
node scripts/add-soft-delete-to-education-requesters.mjs
node scripts/add-soft-delete-to-students.mjs
```

### Manual SQL Execution

Alternatively, you can run the SQL files manually:

```bash
psql -h 168.231.117.70 -U alsalam -d alsalam -f database/create_memberships_table.sql
psql -h 168.231.117.70 -U alsalam -d alsalam -f database/create_auth_tokens_table.sql
psql -h 168.231.117.70 -U alsalam -d alsalam -f database/create_education_tables.sql
psql -h 168.231.117.70 -U alsalam -d alsalam -f database/create_articles_table.sql
```

## PostgreSQL-Specific Features

### Triggers for updated_at

PostgreSQL doesn't support `ON UPDATE CURRENT_TIMESTAMP`. If you need automatic timestamp updates, create a trigger:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON memberships
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Serial vs Auto Increment

PostgreSQL uses `SERIAL` which automatically creates a sequence. The sequence name will be `tablename_columnname_seq`.

## Testing

After migration, test the following:

1. ✅ Membership registration
2. ✅ Education registration
3. ✅ Email confirmation flows
4. ✅ Magic link authentication
5. ✅ Profile management
6. ✅ Cancellation requests

## Troubleshooting

### Connection Issues

- Verify PostgreSQL is running: `systemctl status postgresql`
- Check pg_hba.conf for authentication settings
- Ensure firewall allows connections on port 5432

### Query Errors

- Check parameter placeholders ($1, $2 instead of ?)
- Verify all ENUM values are converted to CHECK constraints
- Ensure SERIAL is used instead of AUTO_INCREMENT

### Data Migration

If you need to migrate existing data from MySQL to PostgreSQL:

1. Export data from MySQL
2. Convert data types as needed
3. Import into PostgreSQL using `COPY` or `INSERT` statements

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [node-postgres (pg) Documentation](https://node-postgres.com/)
- [MySQL to PostgreSQL Migration Guide](https://www.postgresql.org/docs/current/migration.html)
