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

- **GitHub:** `amity-immigration` — push to `main` triggers Vercel deploy
- **Vercel:** import the GitHub repo; set env vars from `.env.example`
- **Supabase:** project `amity-immigration` in `ap-southeast-2`

## Stages

| Stage | Scope |
|-------|-------|
| Bootstrap | Scaffold (this commit) |
| 3 | Supabase schema, RLS, seed |
| 5 | Page sections + content |
| 7 | Admin CMS + auth |
| 8 | Full-text search |

See `brief.md` and `.cursor/rules/site.mdc` for conventions.
