# Supabase setup

1. Create a Supabase project at https://supabase.com/dashboard.
2. In Project Settings → API, copy the project URL and anon/publishable key.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` and in the Vercel project environment settings.
4. In Supabase SQL Editor, run the SQL in `supabase/migrations/0001_initial_schema.sql` (or apply it using the Supabase CLI migration workflow).
5. In Authentication → Providers, enable Email. For Google login, configure the Google provider credentials and authorized redirect URLs in Supabase Auth.
6. In Authentication → URL Configuration, set the Site URL to your deployed domain and add local and production callback/redirect URLs as appropriate.
7. Restart the local development server after changing environment variables.

The service-role key is not needed by the browser application and must never be placed in a `NEXT_PUBLIC_` variable. Do not expose it to client code.

## Current database behavior

- Family workspace creation is performed by the `bootstrap_family` database function, which creates the family and owner membership together.
- Row Level Security restricts family records to active members; edits are limited to owners and editors.
- The initial tree screen supports adding a person and optionally connecting that person as a child of an existing person.
- Run the migration in a disposable development project first and verify RLS policies before production use.
