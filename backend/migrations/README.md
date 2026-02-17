# Database Migrations

This folder contains SQL migration scripts for the DAMP application database.

## How to Run Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of the migration file (e.g., `add_profile_image_column.sql`)
5. Paste into the SQL editor
6. Click **Run** to execute the migration

### Option 2: Using psql Command Line

```bash
psql "your_database_connection_string" -f migrations/add_profile_image_column.sql
```

## Migration Files

### add_profile_image_column.sql
- **Purpose**: Adds `profile_image` column to users table
- **Date**: 2026-02-15
- **Required**: Yes (for profile photo upload feature)
- **Description**: Adds a TEXT column to store profile image URL/URI

## Migration History

| Date | File | Description | Status |
|------|------|-------------|--------|
| 2026-02-15 | add_profile_image_column.sql | Add profile_image column | Pending |

## Notes

- Always backup your database before running migrations
- Test migrations in development environment first
- The `IF NOT EXISTS` clause prevents errors if column already exists
