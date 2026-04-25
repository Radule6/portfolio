# Next.js + Payload + Vercel Migration — Design Spec

**Date:** 2026-04-25
**Branch:** `next-js-migration`
**Status:** Draft, awaiting user review

---

## 1. Goal

Migrate the existing React 19 / Vite SPA at `radule.dev` to a Next.js 15 App Router application, deployed on Vercel, with Payload CMS 3 mounted in-app and backed by a Supabase Postgres database. Outcomes:

- **SEO / AI discoverability** — pre-rendered HTML for `/` and per-project case-study pages.
- **Vercel DX** — preview deploys per PR, replacing the FTP-to-Hostinger workflow.
- **CMS-driven content** — projects (and future content types) edited in a Payload admin UI rather than hard-coded in `Projects.tsx`.
- **Future routes** — case-study detail pages, eventually a blog.

## 2. Scope

### In scope
- Next.js 15 App Router project scaffolded in this repo (replaces Vite).
- Payload 3 mounted at `/admin` with `@payloadcms/db-postgres` against Supabase.
- One Payload collection: `projects` (model below). Plus a built-in `users` collection for auth and a `media` collection for uploads.
- Hybrid routing: `/` (one-page narrative) + `/projects/[slug]` (case studies).
- i18n (EN / HR / DE) preserved with locale-prefixed routing (`/`, `/hr`, `/de`).
- Theme toggle (light/dark) preserved, SSR-safe via `next-themes`.
- All existing components ported (`Hero`, `About`, `Projects`, `Contact`, `Footer`, `Navigation`, `Preloader`, `CommandPalette`, `MetaUpdater`, `ThemeToggle`, `MagneticWrap`).
- Vercel deployment + DNS cutover for `radule.dev`.

### Out of scope
- Blog system (collection scaffolded later, not in this migration).
- Visual redesign — visual parity is a hard requirement.
- A `/contact` form backend — current "Contact" section stays as mailto/links.
- Multi-author / role-based admin — single admin user (you).

## 3. Target Architecture

```
web-portfolio/                            (single Next.js + Payload app)
├── app/
│   ├── (frontend)/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx                Root layout: theme provider, fonts, MetaUpdater
│   │   │   ├── page.tsx                  Home (Hero, About, Projects, Contact, Footer)
│   │   │   └── projects/
│   │   │       └── [slug]/page.tsx       Project case study (SSG'd from Payload)
│   │   └── layout.tsx                    Locale-agnostic shell
│   ├── (payload)/                        Payload admin UI mount (auto-generated)
│   │   ├── admin/[[...segments]]/page.tsx
│   │   └── api/[...slug]/route.ts        Payload REST + GraphQL
│   └── globals.css                       Tailwind v4 layer (moved from src/index.css)
├── src/
│   ├── components/                       Existing components, ported with "use client" where needed
│   ├── i18n/                             next-intl messages (migrated from react-i18next locales)
│   └── payload/
│       ├── payload.config.ts             Payload config (collections, db, plugins)
│       └── collections/
│           ├── Projects.ts
│           ├── Media.ts
│           └── Users.ts
├── public/                               Static assets (favicon, og-image, robots, sitemap)
├── next.config.mjs                       withPayload(...) wrapper
├── middleware.ts                         next-intl locale routing
└── package.json
```

**Key choices:**
- **Single Vercel project, single deploy**, both frontend and Payload admin run in the same Next.js process. This is the official Payload 3 pattern (`withPayload` wrapper).
- **Tailwind v4 retained** — already on v4, no work needed beyond moving `index.css` to `app/globals.css`.
- **App Router only** — no Pages Router fallback.

## 4. Routing & Rendering

| Route | Render mode | Source |
|---|---|---|
| `/`, `/hr`, `/de` | SSG with on-demand revalidation | Payload `projects` collection + i18n messages |
| `/projects/[slug]`, `/[locale]/projects/[slug]` | SSG with on-demand revalidation | Payload `projects` collection |
| `/admin/*` | SSR (Payload's own runtime) | Payload internal |
| `/api/*` | Edge/Node handlers | Payload + custom revalidation webhook |

**Revalidation:** Payload `afterChange` hook on the `projects` collection calls `revalidatePath('/')` and `revalidatePath('/projects/[slug]')` so static pages update within seconds of an admin edit, no full redeploy.

## 5. Content Model — `projects` Collection

Schema (Payload field types):

| Field | Type | Notes |
|---|---|---|
| `title` | text, **localized**, required | Maps to current `t("items.X.title")` |
| `slug` | text, required, unique, indexed | URL segment for case-study page |
| `description` | textarea, **localized**, required | Card-level summary |
| `body` | richText (lexical), **localized**, required | Case-study page body. Empty = no detail page |
| `tags` | array of text | e.g. `["React", "FastAPI", "AWS"]` |
| `accentColor` | text, required | Hex, e.g. `#59FFCE` |
| `heroImage` | upload (→ media), required for featured | Card + case-study hero |
| `gallery` | array of upload | Optional case-study screenshots |
| `liveUrl` | text (URL), optional | |
| `repoUrl` | text (URL), optional | |
| `company` | text, **localized**, optional | e.g. "Exante Data" |
| `role` | text, **localized**, optional | e.g. "Frontend Engineer" |
| `status` | select: `published \| coming-soon \| draft` | Drives card variant + indexability |
| `order` | number | Manual sort on homepage |
| `publishedAt` | date | For ordering, sitemap `lastmod` |
| `seo` | group { title, description, ogImage } | Per-project meta override |

**Seed data:** A one-shot Node script (`scripts/seed-projects.ts`) reads the existing four hardcoded entries from `Projects.tsx` + i18n locale files and inserts them via Payload's Local API on first deploy.

## 6. i18n Strategy

**Decision: migrate from `react-i18next` to `next-intl`.**

Why:
- next-intl integrates with App Router's locale-prefixed routing via middleware (`/`, `/hr/`, `/de/`).
- Server Components can read messages directly — no client-only translation context.
- Static rendering still works per locale (Vercel pre-renders all three).
- `react-i18next` works with Next.js but is client-side only, defeating SSG benefits for translated content.

Migration:
1. Translation JSON files in `src/i18n/locales/{en,hr,de}/*.json` are reformatted to next-intl shape (mostly compatible — the namespacing maps directly).
2. `useTranslation("projects")` calls become `useTranslations("projects")` from next-intl.
3. Payload-stored content (project title/description) is **not** in i18n message files — it comes from Payload's `localized: true` fields.

UI strings stay in message files; CMS-managed content stays in Payload localized fields. Two systems by design — they serve different purposes.

## 7. Hydration & SSR Strategy

The previous SSG attempt was reverted (#418) due to hydration errors. The migration must avoid those mistakes. Audit of current client-only state:

| Component | Client-only behavior | Plan |
|---|---|---|
| `Preloader` | sessionStorage gate, animation timing | `"use client"`, gated by `useEffect` mount; show nothing on SSR (no FOUC because surface is dark by default) |
| `ThemeToggle` | reads `localStorage('radule-theme')` | Replace inline `<script>` in `index.html` + custom toggle with `next-themes` (handles SSR, suppresses warning on `<html>`) |
| `CommandPalette` | keyboard shortcuts, focus trap | `"use client"`, mounted unconditionally — no SSR/CSR divergence |
| `Navigation` | scroll listeners | `"use client"`, render-stable on initial mount |
| `Projects` modal | focus trap, ESC handler | `"use client"`, modal hidden by default — no divergence |
| `MagneticWrap` | mouse tracking | `"use client"` |
| `MetaUpdater` | currently mutates `<head>` from React | **Removed.** Replaced by App Router's `generateMetadata` (per-route, per-locale, server-rendered) |

**Rule for the port:** every component ported as Server Component by default. Add `"use client"` only when the component uses hooks, browser APIs, or event handlers. The `MetaUpdater` deletion is the biggest win — proper Next.js `generateMetadata` solves the SEO motivation natively.

## 8. Media Storage

**Decision: Supabase Storage** via `@payloadcms/storage-s3` (Supabase Storage exposes an S3-compatible API).

Why over Vercel Blob: you're already on Supabase, no second vendor, single bill, single dashboard. Vercel Blob would be marginally simpler config but adds a vendor.

Bucket: `portfolio-media`, public read, authenticated write. Payload's S3 plugin handles signed uploads from the admin UI.

## 9. Infrastructure

**Vercel project:** new project pointed at this repo. Build command: `next build`. Install: `npm ci`.

**Environment variables (Vercel):**
- `DATABASE_URL` — Supabase Postgres connection string (pooled, port 6543, with `?pgbouncer=true`)
- `DATABASE_URL_DIRECT` — Direct connection (port 5432) for Payload migrations
- `PAYLOAD_SECRET` — random 32+ char string
- `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT` — Supabase Storage S3 credentials
- `NEXT_PUBLIC_SERVER_URL` — `https://radule.dev` in prod, `https://<branch>-radule-dev.vercel.app` in preview
- `REVALIDATE_SECRET` — for the on-demand revalidation webhook

**Supabase setup:** new project (or existing), Postgres extensions: `uuid-ossp`. Storage bucket created with policies. Row-level security disabled on Payload's tables (Payload manages auth itself).

**DNS cutover plan:** keep Hostinger live until Vercel build verified at `<vercel-preview-url>`, then flip `radule.dev` A/CNAME records to Vercel. Zero downtime — Vercel issues the cert before DNS propagates.

## 10. Migration Phases (high-level)

The detailed task plan comes from `writing-plans` after this spec is approved. High-level phasing:

1. **Scaffold** — create Next.js 15 app structure in this branch (replaces Vite at the end), wire Tailwind v4, port `globals.css`.
2. **Static port + hydration discipline** — move all components, audit each for client/server boundary, replace inline theme script with `next-themes`, kill `MetaUpdater`, swap to `generateMetadata`. Replace anchor-only navigation with App Router structure. App must `next build && next start` cleanly with zero hydration warnings before this phase ends.
3. **i18n migration** — replace `react-i18next` with `next-intl`, set up `[locale]` segment, middleware.
4. **Payload integration** — install Payload + Postgres + S3 plugins, add `payload.config.ts`, mount `/admin` and `/api`, define `projects` + `media` + `users` collections.
5. **Supabase wire-up** — provision DB + storage bucket, run Payload migrations, seed projects from existing hardcoded data.
6. **Data binding** — replace hardcoded project array in `Projects.tsx` with `getPayload()` Local API call in the Server Component.
7. **Case-study pages** — `/[locale]/projects/[slug]/page.tsx` with `generateStaticParams` from Payload.
8. **Vercel deploy** — connect repo, configure env vars, verify preview deploys, verify Payload admin works on preview URL.
9. **Cutover** — flip DNS, decommission Hostinger workflow (delete `.github/workflows/deploy.yml`), update README and CLAUDE.md.

Each phase is independently testable; phase 2's "build cleanly with zero hydration warnings" gate is the most important checkpoint, since hydration is what killed the previous SSG attempt.

## 11. Open Decisions (please confirm)

These are decisions I made or flagged that you should explicitly accept or override before we move to the implementation plan:

1. **App Router** (not Pages Router) — confirmed implicitly by the migration goal.
2. **next-intl** to replace `react-i18next` — moderate-effort migration but unlocks SSG'd translated pages. Alternative: keep `react-i18next` and accept that translated content renders client-side only.
3. **Supabase Storage** for media (not Vercel Blob).
4. **Hardcoded projects in `Projects.tsx` get migrated into Payload via a seed script** — acceptable for the four current entries.
5. **`MetaUpdater` component is deleted** — replaced by per-route `generateMetadata`. The `noscript` SEO content in `index.html` is also replaced (App Router renders the real content server-side).
6. **Single admin user (you).** Auth via Payload's built-in users collection — email + password. Add 2FA in a follow-up if desired.
7. **DNS cutover** happens at the end, after Vercel preview verified. Hostinger workflow file deleted in the same PR.
8. **No blog yet** — `posts` collection deferred to a separate spec.

## 12. Success Criteria

- `npm run build` succeeds locally and on Vercel.
- `radule.dev` (post-cutover) returns pre-rendered HTML for `/`, `/hr`, `/de`, and each `/projects/[slug]` — verified via `curl -s | grep` for project titles in the response body.
- Payload admin reachable at `radule.dev/admin`, can log in, can edit a project, edited content appears on the public page within 30 seconds (revalidation hook).
- Lighthouse Performance ≥ 95 on `/` (mobile).
- All three locales render correctly with translated CMS content.
- No hydration warnings in browser console.
- Existing visual design (typography, gradient, spacing, animations) matches current site within tolerance.

## 13. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Hydration mismatch returns (the #418 problem) | Strict server/client component discipline, `next-themes` for theme, audit each ported component, run `next build && next start` before declaring done |
| Supabase Postgres connection limits hit during build | Use pooled URL for runtime, direct URL only for migrations; Payload supports both via its `db` config |
| Payload admin bundle bloats client builds | Payload's admin lives under its own route group `(payload)` — bundle is separate, doesn't touch `(frontend)` routes |
| i18n migration loses translations | Lock the existing `src/i18n/locales/*.json` as the source of truth, write a small transform script if next-intl shape differs, diff before committing |
| DNS cutover causes downtime | Verify Vercel preview fully working first; A-record TTL lowered 24h before flip |

## 14. Future Work (out of this migration)

- `posts` collection + `/blog` routes
- Sitemap auto-generated from Payload data (currently static `public/sitemap.xml`)
- RSS feed for blog
- Analytics (Vercel Analytics or Plausible)
- 2FA for Payload admin
- Search across projects/posts
