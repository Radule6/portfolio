# radule.dev

Personal developer portfolio for Marko Radulovic — full-stack engineer building AI-powered data products for fintech.

**Live:** [radule.dev](https://radule.dev)

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript 5.8
- **CMS:** Payload CMS 3 mounted in-app at `/admin` (`payload`, `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`, `@payloadcms/storage-s3`)
- **Database / Storage:** Supabase Postgres + Supabase Storage (S3-compatible) for media
- **Styling:** Tailwind CSS v4 via `@tailwindcss/postcss`
- **Fonts:** Syne (display) + Outfit (body) via `next/font/google`
- **Themes:** `next-themes` (dark default, light override)
- **Deployment:** Vercel via Vercel CLI, gated behind a GitHub Actions workflow (lint + typecheck + build)

## Project Structure

```
app/
  (frontend)/              # Public site root layout (own <html>/<body>)
    layout.tsx
    page.tsx               # Home
    blog/                  # /blog, /blog/[slug]
    projects/              # /projects/[slug] (case studies)
    feed.xml/              # RSS 2.0
  (payload)/               # Payload admin root layout (isolated)
    layout.tsx
    admin/                 # /admin
    api/                   # Payload REST/GraphQL API routes
  globals.css              # Theme tokens, animations, utility classes
  sitemap.ts               # Dynamic sitemap

src/
  components/              # Folder-per-component (Hero, About, Projects, Blog, Navigation, ...)
  lib/                     # site-config, structured-data, blog-toc, format-date, use-is-client
  payload/
    collections/           # users, media, projects, posts
    components/            # Custom admin UI
    hooks/                 # autoSlug, computeReadingTime, revalidatePost
    migrations/            # Payload migrations
  payload.config.ts
  payload-types.ts         # Generated; run `npm run payload:generate:types` to refresh
```

## Design System

- **Brand gradient:** `#59FFCE → #B7FF03 → #FFFF00` (green → lime → yellow), applied via `.gradient-text`
- **Theme:** Dark default with full light override
- **Custom animations:** staggered reveals, kinetic hero entrance, floating orb, marquee, bento card hovers
- Mobile-first, responsive up to Tailwind's `3xl`

## Getting Started

```bash
npm install
cp .env.example .env.local   # then fill in DATABASE_URL, PAYLOAD_SECRET, S3_*, etc.
npm run dev
```

The dev server boots at `http://localhost:3000`. The Payload admin lives at `http://localhost:3000/admin` and uses the same Supabase Postgres + S3-compatible storage as production.

## Scripts

| Command                         | Description                                             |
| ------------------------------- | ------------------------------------------------------- |
| `npm run dev`                   | Start Next.js dev server                                |
| `npm run build`                 | Production build (`.next/`)                             |
| `npm run start`                 | Run the production build locally                        |
| `npm run lint`                  | ESLint (`eslint .`)                                     |
| `npm run typecheck`             | TypeScript (`tsc --noEmit`)                             |
| `npm run payload`               | Payload CLI                                             |
| `npm run payload:migrate`       | Apply Payload database migrations                       |
| `npm run payload:generate:types`| Regenerate `src/payload-types.ts`                       |

## Deployment

Every push and every PR runs the GitHub Actions workflow at `.github/workflows/deploy.yml`. It:

1. Installs deps, runs `npm run lint` + `npm run typecheck` (build gate — both must pass).
2. Pulls the matching Vercel environment (`production` for `main`, `preview` otherwise).
3. Runs `vercel build` with the runtime env wired in.
4. Calls `vercel deploy --prebuilt` (with `--prod` on `main`).

A failing lint, typecheck, or build never reaches Vercel. Vercel's own git auto-deploy is disabled — the GHA workflow is the only path to a deploy.

Required GitHub secrets:

- Vercel: `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN`
- Runtime: `DATABASE_URL`, `DATABASE_URL_DIRECT`, `PAYLOAD_SECRET`, `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `SUPABASE_PROJECT_HOST`
