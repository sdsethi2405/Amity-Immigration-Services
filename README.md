# Amity Immigration Services

Registered migration agent website for Amity Immigration Services, Bundoora VIC.

**Project root:** `C:\Users\simar\Downloads\AIS Project`

## Stack

Next.js 15 (App Router) · TypeScript strict · Tailwind CSS 4 · shadcn/ui · Supabase · pnpm

## Local development

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

## Deploy

- **GitHub:** [sdsethi2405/AIS-Project](https://github.com/sdsethi2405/AIS-Project) — push to `main` triggers Vercel deploy
- **Vercel:** [amity-immigration-services](https://vercel.com/cri-projects/amity-immigration-services) (Crimson Industries) — production URL https://ais-project-gamma.vercel.app
- **Supabase:** project **AIS Project** (`cwecfcjjmcinztzlhtsl`) in `ap-southeast-2`

Set `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SECRET_KEY`) and `SESSION_SECRET` in Vercel from [Supabase API settings](https://supabase.com/dashboard/project/cwecfcjjmcinztzlhtsl/settings/api-keys).

## Stages

| Stage | Scope |
|-------|-------|
| Bootstrap | Scaffold (this commit) |
| 3 | Supabase schema, RLS, seed |
| 5 | Page sections + content |
| 7 | Admin CMS + auth |
| 8 | Full-text search |

See `brief.md` and `.cursor/rules/site.mdc` for conventions.
