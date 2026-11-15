# CalorIQ — React + Vite + Supabase

CalorIQ is a personal wellness dashboard with Supabase email/password authentication, profile onboarding, and per-user private wellness data.

## 1. Requirements

- Node.js 18 or newer (Node.js LTS recommended)
- A Supabase account and project

## 2. Install dependencies

```bash
npm install
```

## 3. Create your Supabase project

1. Open https://supabase.com/ and create a project.
2. In the Supabase dashboard, open **Project Settings → API** (or **Data API / API Keys**, depending on dashboard version).
3. Copy the **Project URL** and the **publishable key** (or legacy `anon` public key). Never use the `service_role` / secret key in a browser app.
4. In the project root, make a copy of `.env.example` and name it `.env`.
5. Replace the placeholders:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

The publishable/anon key is intended for browser use. Database access is protected by the Row Level Security policies in the next step.

## 4. Create the database tables and security policies

1. In Supabase, open **SQL Editor → New query**.
2. Open `supabase-schema.sql` in this project.
3. Copy the complete SQL into the editor and click **Run**.

This creates:

- `profiles` — each user's basic profile and fitness preferences.
- `user_data` — each user's meals, steps, water and sleep values.
- Row Level Security (RLS) policies that restrict every row to its owner.
- A signup trigger that creates an initial profile and wellness-data row.

Do not disable RLS. Do not expose a service-role key in this frontend project.

## 5. Configure email authentication

In Supabase, open **Authentication → URL Configuration**:

- Set **Site URL** to `http://localhost:5173` for local development.
- Add `http://localhost:5173/**` to the allowed redirect URLs if your dashboard asks for it.

For real deployments, add your deployed domain as the Site URL / allowed redirect URL and enable the email confirmation settings you want.

## 6. Run CalorIQ

Stop any running Vite server, then in the project terminal:

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (usually http://localhost:5173).

## How it works

- New users create an account with email and password.
- If email confirmation is enabled in Supabase, they must confirm their email before signing in.
- After first sign-in, they complete their profile: age, gender, height, weight, activity level and fitness goal.
- Their profile and dashboard data are saved to Supabase and loaded for that authenticated user.
- Sign out ends the Supabase session.

## Security notes

- Supabase Auth handles passwords; this app never stores passwords in its own tables.
- The frontend uses only the publishable/anon key. RLS is the security boundary for database rows.
- `profiles.id` and `user_data.user_id` reference `auth.users(id)` and policies compare those IDs with `auth.uid()`.
- This is a starter implementation. Before public production use, add email/password reset UX, rate limiting / abuse protection, privacy and data-retention disclosures, and review the RLS policies in the Supabase dashboard.
