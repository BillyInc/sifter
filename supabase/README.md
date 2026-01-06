# Supabase Database Setup

This folder contains database migrations and configuration for Sifter's Supabase backend.

## Schema Architecture

Sifter uses a dedicated **`sifter_dev`** schema (not the default `public` schema). This keeps our tables organized and separate from Supabase system tables.

```
postgres (database)
├── public          # Supabase default schema (auth, etc.)
├── sifter_dev      # Our development schema <-- tables go here
└── extensions      # PostgreSQL extensions
```

---

## Quick Start (Easiest Way)

If you just want to set up the database quickly:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Copy the contents of `migrations/20250106000001_create_feedback_table.sql`
5. Paste and click **Run**
6. **Important:** Expose the schema (see below)

### Expose the `sifter_dev` Schema

After running the migration, you need to expose the schema via the API:

1. Go to **Project Settings** > **API**
2. Scroll to **Exposed schemas**
3. Add `sifter_dev` to the list
4. Click **Save**

Without this step, the API won't be able to access tables in the `sifter_dev` schema.

Done! Your database is set up.

---

## Understanding the Files

```
supabase/
├── config.toml          # Local development settings (for `supabase start`)
├── migrations/          # Database schema changes
│   └── 20250106000001_create_feedback_table.sql
└── README.md            # This file
```

### `config.toml`
Configuration for running Supabase **locally** on your machine. You only need this if you want to:
- Develop offline without internet
- Test database changes before pushing to production
- Run the full Supabase stack locally (database, auth, storage)

### `migrations/` folder
SQL files that create or modify your database schema. Each file is timestamped so they run in order.

**Naming format:** `YYYYMMDDHHMMSS_description.sql`

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

### Required Variables

| Variable | Where to Find | Description |
|----------|---------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Dashboard > Settings > API | Your project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Dashboard > Settings > API | The `anon` public key |

### Optional Variables

| Variable | Where to Find | Description |
|----------|---------------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Dashboard > Settings > API | Admin key (server-side only!) |
| `DATABASE_URL` | Dashboard > Settings > Database | Direct DB connection string |

---

## Running Migrations

### Option 1: Supabase Dashboard (Recommended for beginners)

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor**
3. Copy/paste each migration file
4. Click **Run**

### Option 2: Supabase CLI (Recommended for teams)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (get project-id from dashboard URL)
supabase link --project-ref your-project-id

# Push migrations to production
supabase db push
```

### Option 3: Local Development

```bash
# Make sure Docker Desktop is running

# Start local Supabase (first time takes a few minutes)
supabase start

# Your local URLs will be:
# - API: http://127.0.0.1:54321
# - Studio: http://127.0.0.1:54323 (database UI)
# - Inbucket: http://127.0.0.1:54324 (email testing)

# Apply migrations locally
supabase db reset

# Stop local Supabase
supabase stop
```

---

## Creating New Migrations

When you need to change the database schema:

```bash
# Using Supabase CLI
supabase migration new your_migration_name

# Or manually create a file:
# supabase/migrations/YYYYMMDDHHMMSS_your_migration_name.sql
```

**Example migration (adding a column):**

```sql
-- migrations/20250107000001_add_rating_to_feedback.sql
ALTER TABLE sifter_dev.feedback
ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);
```

---

## Current Tables

### `sifter_dev.feedback`
Stores user feedback from the dashboard modal.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `dashboard_opinion` | TEXT | What they think about the dashboard |
| `improvements` | TEXT | What they want improved |
| `would_use` | VARCHAR(10) | 'yes', 'no', or 'maybe' |
| `solves_problem` | TEXT | Does it solve a problem for them |
| `referral_name` | TEXT | Name of someone who'd benefit |
| `referral_twitter` | VARCHAR(100) | Twitter handle of referral |
| `email` | VARCHAR(255) | Optional contact email |
| `submitted_at` | TIMESTAMPTZ | When feedback was submitted |
| `source` | VARCHAR(50) | Where it came from (web, api) |

**Row Level Security:**
- Anyone can INSERT (submit feedback)
- Only authenticated users can SELECT/UPDATE/DELETE

---

## Troubleshooting

### "relation does not exist" error
The migration hasn't been run. Go to SQL Editor and run the migration.

### "permission denied" error
Check that Row Level Security policies are set up correctly. The migration includes these.

### Can't connect to Supabase
1. Check your `.env.local` has the correct URL and key
2. Make sure there are no trailing spaces in your env values
3. Verify the project is not paused in the dashboard

### Local Supabase won't start
1. Make sure Docker Desktop is running
2. Try `supabase stop` then `supabase start` again
3. Check if ports 54321-54329 are available

---

## Useful Commands

```bash
# Check migration status
supabase migration list

# Generate types from database (for TypeScript)
supabase gen types typescript --local > src/types/database.ts

# View database logs
supabase db logs

# Reset local database (runs all migrations fresh)
supabase db reset

# Diff local vs remote database
supabase db diff
```

---

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [SQL Editor Guide](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
