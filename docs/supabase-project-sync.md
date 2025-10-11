# Supabase Project Realignment Guide

If you accidentally provision tables in the wrong Supabase project (for example, "The Revenue Scientists Website") you can safely realign the schema so the "TRESVOS" app becomes the source of truth. This guide walks through exporting data, pointing the CLI at the correct project, and overriding the remote database with the schema and seeds that live in this repository.

## 1. Backup the mistaken project
1. Open the Supabase dashboard for the **incorrect** project.
2. In **Table editor**, use the export button to download CSV backups for any tables you care about preserving.
3. Alternatively, run the following SQL in the dashboard's **SQL Editor** to export a full dump:
   ```sql
   select * from storage.export_bucket('public', 'backup-folder');
   ```
4. Store those exports locally—you will reset the tables in the target project during the next steps.

## 2. Grab credentials for the TRESVOS project
1. Navigate to the Supabase dashboard for **TRESVOS**.
2. Copy the "Project URL" and "anon" key from **Project Settings → API**.
3. Update your `.env.local` to point the web app at the correct project:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<tresvos-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   ```
4. Restart `pnpm dev` (or your production deploy) so the app uses the new credentials.

## 3. Link the Supabase CLI to TRESVOS
The Supabase CLI can push migrations and seeds stored in `supabase/`. Authenticate and link it to the correct project:
```bash
supabase login                       # once per machine
export SUPABASE_PROJECT_REF=<tresvos-ref>
export SUPABASE_ACCESS_TOKEN=<personal-access-token>
supabase link --project-ref "$SUPABASE_PROJECT_REF"
```

> ℹ️ Generate a personal access token from **Account → Access Tokens** inside Supabase. Linking stores the ref in `.supabase` so subsequent commands know which project to target.

## 4. Override the remote schema with repo migrations
With the CLI linked you can apply the repo's canonical schema (`supabase/schema.sql`) and migrations:
```bash
# WARNING: this clears existing tables/data in the linked project
supabase db reset --linked --remote
```

The command runs every migration under `supabase/migrations/` and then applies `supabase/seed.sql` so your remote project matches the codebase.

If you prefer not to wipe data, swap the reset for a push:
```bash
supabase db push --linked --remote
supabase db seed --linked --remote
```

## 5. Re-import any saved data (optional)
If you exported CSVs in step 1, re-import them through the Supabase dashboard or by using `psql` commands:
```bash
psql "postgresql://postgres:<password>@db.<tresvos-ref>.supabase.co:5432/postgres" \
  -c "\copy public.my_table from 'my_table.csv' with csv header"
```

## 6. Verify in Supabase Studio
1. Open the **Table Editor** for TRESVOS and spot-check that all tables listed in `supabase/schema.sql` exist.
2. Confirm seed data by running the verification queries from `scripts/README.md`.
3. Launch the local app—pipeline, clients, projects, and integrations should now read/write against the TRESVOS project.

Following these steps ensures you override the incorrect project and keep the Next.js app, scripts, and Supabase migrations in lockstep.
