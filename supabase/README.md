# Supabase SQL Files

Use these files for the logo library table:

- `logo_library_schema.sql`
  Fresh setup for the `favorite_logos` table and its policies/indexes.

- `logo_library_upgrade.sql`
  Safe upgrade script for existing databases that need `Favorites`, `Saved`, and `Downloads` support.

Recommended usage:

1. New project/database:
   Run `logo_library_schema.sql`

2. Existing project/database:
   Run `logo_library_upgrade.sql`
