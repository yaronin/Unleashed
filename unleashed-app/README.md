# Unleashed Beginner Training App

Calisthenics training app for the **Vitaliy Fechuk Unleashed Beginner** program. Register with email/password, log workouts, track PRs, and view progress — stored per user in **Supabase** (Postgres).

## Features

- **Email/password auth** — register, sign in, sign out
- **Today's workout** — week/day navigator with prescribed exercises
- **Workout logger** — log sets, reps, hold times, and notes
- **Progress dashboard** — streak, weekly volume, exercise trends, PRs, history
- **Exercise library** — 53 exercises with GIF previews
- **Admin dashboard** (`/admin`) — manage users, roles, disable accounts
- **PWA** — installable on phone; static assets cached offline

## Quick start

### 1. Supabase setup

1. Create a free project at [supabase.com](https://supabase.com)
2. In **SQL Editor**, run the full script: [`supabase/migrations/001_schema.sql`](supabase/migrations/001_schema.sql)
3. Copy **Project URL** and **anon public key** from Settings → API
4. Create `.env.local`:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

5. (Optional) Disable email confirmation for faster dev: Authentication → Providers → Email
6. Register your account in the app, then promote to admin in SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'your@email.com';
```

### 2. Run locally

```bash
cd unleashed-app
npm install
npm run map-exercises   # populate GIF URLs (no API key needed)
npm run dev
```

Open http://localhost:5173 — you will be redirected to `/login`.

### 3. Deploy to Vercel

| Setting | Value |
|---------|-------|
| Root directory | `unleashed-app` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Env vars | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

In Supabase → Authentication → URL Configuration, add your Vercel URL:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/**`

### 4. Admin delete user (Edge Function)

Deploy the optional edge function for hard user deletion:

```bash
supabase functions deploy admin-delete-user
```

The function uses `SUPABASE_SERVICE_ROLE_KEY` (auto-injected by Supabase). Without it, use **Disable** in the admin UI instead of **Delete**.

## Exercise GIFs

GIFs from [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) via jsDelivr CDN. Run `npm run map-exercises` to refresh mappings.

## Data model (Supabase)

| Table | Purpose |
|-------|---------|
| `profiles` | User email, role (`user`/`admin`), `is_active` |
| `user_state` | Program position, start date, advancement mode |
| `workout_logs` | Completed sessions (exercises as JSONB) |
| `personal_records` | Best reps/hold per exercise |

Row Level Security ensures users only access their own data. Admins can read all profiles and workout counts.

## Tech stack

- React 19 + TypeScript + Vite
- Supabase (Auth + Postgres + RLS)
- TanStack React Query
- Tailwind CSS 4 + Recharts + vite-plugin-pwa
