# Plan 2 — Payload CMS + Supabase + Projects CMS-Driven + Case-Study Pages

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mount Payload CMS 3 inside the existing Next.js app at `/admin`, back it with a Supabase Postgres database and Supabase Storage (S3-compatible) for media, define the `users`, `media`, `projects`, and `posts` collections, replace the hardcoded projects array with a Payload Local-API query, and add `/projects/[slug]` case-study pages with on-demand revalidation. The blog frontend (`/blog`) is intentionally deferred to Plan 4 — the `posts` collection exists but isn't yet consumed by any public route.

**Architecture:** Single Next.js app, two route groups: `(frontend)` for the public site, `(payload)` for the admin panel and Payload's REST/GraphQL endpoints. Postgres connection lives in env; Local API is used in Server Components for build-time data fetching with `revalidatePath` hooks for instant cache invalidation when content changes.

**Tech Stack:** payload 3 (latest 3.x), `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/storage-s3`, `@payloadcms/richtext-lexical`. Supabase (Postgres + Storage). next-themes, Tailwind v4 (unchanged from Plan 1).

**Spec:** `docs/superpowers/specs/2026-04-25-nextjs-migration-design.md`

**Branch:** `next-js-migration` (continuing from Plan 1).

---

## File Map

### Created
- `src/payload.config.ts` — Payload config: collections, db, plugins, admin, lexical editor.
- `src/payload/collections/Users.ts` — single-admin auth collection.
- `src/payload/collections/Media.ts` — uploads collection, S3-backed.
- `src/payload/collections/Projects.ts` — projects content type (full schema from spec §5.1).
- `src/payload/collections/Posts.ts` — posts content type (full schema from spec §5.2). No public route consumes it yet — Plan 4 adds `/blog`.
- `src/payload/hooks/revalidate-project.ts` — `afterChange`/`afterDelete` hooks revalidating `/`, `/projects/[slug]`.
- `src/payload/hooks/revalidate-post.ts` — analogous for posts (revalidates `/blog`, `/blog/[slug]`, `/feed.xml`). Stubbed for Plan 4 readiness.
- `src/payload/hooks/auto-slug.ts` — generic `beforeChange` hook that auto-generates a slug from `title` when `slug` is empty.
- `src/payload/hooks/reading-time.ts` — `beforeChange` hook for `posts.body` → `posts.readingTime` word count.
- `app/(payload)/admin/[[...segments]]/page.tsx` — Admin panel mount (server-rendered by Payload).
- `app/(payload)/admin/[[...segments]]/not-found.tsx` — Admin not-found page.
- `app/(payload)/api/[...slug]/route.ts` — Payload REST + GraphQL endpoints.
- `app/(payload)/layout.tsx` — Admin layout (no theme provider, no fonts wrapper — Payload manages its own UI).
- `app/(frontend)/projects/[slug]/page.tsx` — Project case-study page with `generateStaticParams` and `generateMetadata`.
- `src/components/RichText/RichText.tsx` — Lexical → React renderer for `body` fields.
- `scripts/seed-projects.ts` — One-shot seed populating four hardcoded projects from `Projects.tsx` legacy data.
- `.env.example` — Template for required environment variables.

### Modified
- `next.config.mjs` — Wrap export with `withPayload`, add Supabase Storage to `images.remotePatterns`.
- `src/components/Projects/Projects.tsx` — Become a thin client wrapper. Data fetching moves to a sibling `ProjectsServer.tsx` Server Component which calls `getPayload()` and passes data as props.
- `src/components/Projects/ProjectsServer.tsx` — New: Server Component that fetches projects via Local API.
- `app/page.tsx` — Use `ProjectsServer` instead of `Projects`.
- `package.json` — Add Payload deps + `payload` and `payload:migrate` scripts.
- `tsconfig.json` — Add `@payload-config` path alias.

### Deleted
- None in this plan. (Hardcoded project data inside `Projects.tsx` is *removed*, but the file itself stays.)

---

## Prerequisites — what YOU need ready

These are external accounts/resources the plan will pull from. Don't create them upfront — the plan walks you through it at the right phase.

- A Supabase account (free tier is fine).
- A GitHub account with access to push to this repo (already true).
- A terminal where you'll run `npm` and `npx payload` commands. (Vercel deploy is Plan 3.)

---

## Verification model

Same as Plan 1: this is a UI/migration plan, not a logic plan. Tests are concrete runnable verifications:
- TypeScript: `npx tsc --noEmit` exits 0
- Lint: `npm run lint` clean
- Build: **YOU run** `npm run build` and confirm it succeeds (don't ask me to)
- Runtime: **YOU run** `npm run dev` and confirm `/admin` loads, you can sign in, the seed projects appear in the admin and on `/`
- The Supabase dashboard shows `payload_*` tables created and rows for collection documents

---

## Task 1: Install Payload + adapter packages

**Files:** `package.json`

- [ ] **Step 1: Install Payload core, Postgres adapter, S3 storage, Lexical editor**

```bash
npm install payload @payloadcms/next @payloadcms/db-postgres @payloadcms/storage-s3 @payloadcms/richtext-lexical sharp graphql
```

`sharp` is required for Payload's image processing. `graphql` is a peer dependency.

- [ ] **Step 2: Add `@payload-config` path alias**

Edit `tsconfig.json`, replace the `paths` block:
```json
"paths": {
  "@/*": ["./src/*"],
  "@payload-config": ["./src/payload.config.ts"]
}
```

- [ ] **Step 3: Add Payload CLI scripts**

Edit `package.json` `scripts` block, add:
```json
"payload": "PAYLOAD_CONFIG_PATH=src/payload.config.ts payload",
"payload:migrate": "PAYLOAD_CONFIG_PATH=src/payload.config.ts payload migrate",
"payload:generate:types": "PAYLOAD_CONFIG_PATH=src/payload.config.ts payload generate:types"
```

- [ ] **Step 4: Verify install**

```bash
npx tsc --noEmit
```
Expected: exits 0 (paths alias accepted; no other code changes yet).

---

## Task 2: Define collections — Users, Media, Projects, Posts

**Files:** create `src/payload/collections/Users.ts`, `Media.ts`, `Projects.ts`, `Posts.ts`. Plus shared hook helpers.

- [ ] **Step 1: Create `src/payload/hooks/auto-slug.ts`**

```ts
import type { CollectionBeforeChangeHook } from "payload"

export const autoSlug =
  (sourceField = "title"): CollectionBeforeChangeHook =>
  ({ data, operation, originalDoc }) => {
    if (data.slug && data.slug.trim().length > 0) return data
    const source = (data as Record<string, unknown>)[sourceField] ?? originalDoc?.[sourceField]
    if (typeof source !== "string" || source.length === 0) return data
    if (operation === "create" || operation === "update") {
      data.slug = source
        .toLowerCase()
        .trim()
        .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80)
    }
    return data
  }
```

- [ ] **Step 2: Create `src/payload/hooks/reading-time.ts`**

```ts
import type { CollectionBeforeChangeHook } from "payload"

const WORDS_PER_MINUTE = 220

function countWords(node: unknown): number {
  if (!node) return 0
  if (typeof node === "string") return node.trim().split(/\s+/).filter(Boolean).length
  if (Array.isArray(node)) return node.reduce<number>((sum, n) => sum + countWords(n), 0)
  if (typeof node === "object") {
    const obj = node as Record<string, unknown>
    if (typeof obj.text === "string") return countWords(obj.text)
    if (Array.isArray(obj.children)) return countWords(obj.children)
    if (obj.root) return countWords(obj.root)
  }
  return 0
}

export const computeReadingTime: CollectionBeforeChangeHook = ({ data }) => {
  const words = countWords(data.body)
  data.readingTime = Math.max(1, Math.round(words / WORDS_PER_MINUTE))
  return data
}
```

- [ ] **Step 3: Create `src/payload/hooks/revalidate-project.ts`**

```ts
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload"
import { revalidatePath } from "next/cache"

export const revalidateProject: CollectionAfterChangeHook = ({ doc, previousDoc, req: { context } }) => {
  if (context?.disableRevalidate) return doc
  revalidatePath("/")
  if (doc?.slug) revalidatePath(`/projects/${doc.slug}`)
  if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
    revalidatePath(`/projects/${previousDoc.slug}`)
  }
  return doc
}

export const revalidateProjectDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (context?.disableRevalidate) return doc
  revalidatePath("/")
  if (doc?.slug) revalidatePath(`/projects/${doc.slug}`)
  return doc
}
```

- [ ] **Step 4: Create `src/payload/hooks/revalidate-post.ts`** (Plan 4 will start consuming this; stubbed now so collection wiring stays consistent)

```ts
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload"
import { revalidatePath } from "next/cache"

export const revalidatePost: CollectionAfterChangeHook = ({ doc, previousDoc, req: { context } }) => {
  if (context?.disableRevalidate) return doc
  revalidatePath("/blog")
  revalidatePath("/feed.xml")
  if (doc?.slug) revalidatePath(`/blog/${doc.slug}`)
  if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
    revalidatePath(`/blog/${previousDoc.slug}`)
  }
  return doc
}

export const revalidatePostDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (context?.disableRevalidate) return doc
  revalidatePath("/blog")
  revalidatePath("/feed.xml")
  if (doc?.slug) revalidatePath(`/blog/${doc.slug}`)
  return doc
}
```

- [ ] **Step 5: Create `src/payload/collections/Users.ts`**

```ts
import type { CollectionConfig } from "payload"

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "createdAt"],
  },
  auth: true,
  fields: [
    { name: "name", type: "text" },
  ],
}
```

- [ ] **Step 6: Create `src/payload/collections/Media.ts`**

```ts
import type { CollectionConfig } from "payload"

export const Media: CollectionConfig = {
  slug: "media",
  upload: {
    mimeTypes: ["image/png", "image/jpeg", "image/webp", "image/avif", "image/svg+xml"],
  },
  admin: { defaultColumns: ["filename", "alt", "createdAt"] },
  access: { read: () => true },
  fields: [
    { name: "alt", type: "text", required: true, label: "Alt text" },
  ],
}
```

- [ ] **Step 7: Create `src/payload/collections/Projects.ts`**

```ts
import type { CollectionConfig } from "payload"
import { autoSlug } from "../hooks/auto-slug"
import { revalidateProject, revalidateProjectDelete } from "../hooks/revalidate-project"

export const Projects: CollectionConfig = {
  slug: "projects",
  labels: { singular: "Project", plural: "Projects" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "company", "status", "order", "publishedAt"],
    group: "Content",
    listSearchableFields: ["title", "slug", "company"],
  },
  defaultSort: "order",
  hooks: {
    beforeChange: [autoSlug("title")],
    afterChange: [revalidateProject],
    afterDelete: [revalidateProjectDelete],
  },
  fields: [
    { name: "title", type: "text", required: true, index: true },
    { name: "slug", type: "text", required: true, unique: true, index: true, admin: { position: "sidebar" } },
    { name: "description", type: "textarea", required: true },
    { name: "body", type: "richText" },
    { name: "tags", type: "array", fields: [{ name: "label", type: "text", required: true }] },
    { name: "accentColor", type: "text", required: true, defaultValue: "#59FFCE", admin: { description: "Hex color, e.g. #59FFCE" } },
    { name: "heroImage", type: "upload", relationTo: "media" },
    { name: "gallery", type: "array", fields: [{ name: "image", type: "upload", relationTo: "media", required: true }] },
    { name: "liveUrl", type: "text" },
    { name: "repoUrl", type: "text" },
    { name: "company", type: "text" },
    { name: "role", type: "text" },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "published",
      options: [
        { label: "Published", value: "published" },
        { label: "Coming soon", value: "coming-soon" },
        { label: "Draft", value: "draft" },
      ],
    },
    { name: "order", type: "number", defaultValue: 0, admin: { position: "sidebar", description: "Manual sort on homepage (lower first)" } },
    { name: "publishedAt", type: "date", admin: { position: "sidebar" } },
    {
      name: "seo",
      type: "group",
      fields: [
        { name: "title", type: "text" },
        { name: "description", type: "textarea" },
        { name: "ogImage", type: "upload", relationTo: "media" },
      ],
    },
  ],
  timestamps: true,
}
```

- [ ] **Step 8: Create `src/payload/collections/Posts.ts`**

```ts
import type { CollectionConfig } from "payload"
import { autoSlug } from "../hooks/auto-slug"
import { computeReadingTime } from "../hooks/reading-time"
import { revalidatePost, revalidatePostDelete } from "../hooks/revalidate-post"

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Post", plural: "Posts" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "publishedAt", "readingTime"],
    group: "Content",
    listSearchableFields: ["title", "slug"],
    description: "Blog posts. Public /blog routes are added in Plan 4.",
  },
  defaultSort: "-publishedAt",
  hooks: {
    beforeChange: [autoSlug("title"), computeReadingTime],
    afterChange: [revalidatePost],
    afterDelete: [revalidatePostDelete],
  },
  fields: [
    { name: "title", type: "text", required: true, index: true },
    { name: "slug", type: "text", required: true, unique: true, index: true, admin: { position: "sidebar" } },
    { name: "excerpt", type: "textarea", required: true, admin: { description: "Used in listing cards and as default <meta description>" } },
    { name: "body", type: "richText", required: true },
    { name: "coverImage", type: "upload", relationTo: "media", required: true },
    { name: "tags", type: "array", fields: [{ name: "label", type: "text", required: true }] },
    { name: "author", type: "relationship", relationTo: "users", required: true, admin: { position: "sidebar" } },
    { name: "publishedAt", type: "date", required: true, admin: { position: "sidebar" } },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
    },
    { name: "readingTime", type: "number", admin: { position: "sidebar", readOnly: true, description: "Auto-computed from body word count" } },
    {
      name: "seo",
      type: "group",
      fields: [
        { name: "title", type: "text" },
        { name: "description", type: "textarea" },
        { name: "ogImage", type: "upload", relationTo: "media" },
      ],
    },
  ],
  timestamps: true,
}
```

- [ ] **Step 9: Type-check**

```bash
npx tsc --noEmit
```
Expected: exits 0. Errors at this point usually mean a typo in field config or a missing type — fix them.

---

## Task 3: Build payload.config.ts

**Files:** create `src/payload.config.ts`.

- [ ] **Step 1: Create the config**

```ts
import path from "path"
import { fileURLToPath } from "url"
import { buildConfig } from "payload"
import { postgresAdapter } from "@payloadcms/db-postgres"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
import { s3Storage } from "@payloadcms/storage-s3"

import { Users } from "./payload/collections/Users"
import { Media } from "./payload/collections/Media"
import { Projects } from "./payload/collections/Projects"
import { Posts } from "./payload/collections/Posts"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      title: "RADULE.DEV admin",
      description: "Manage projects and posts",
    },
  },
  collections: [Users, Media, Projects, Posts],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(__dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
    push: false, // Production-grade: use migrations, not auto-push.
  }),
  plugins: [
    s3Storage({
      collections: { media: true },
      bucket: process.env.S3_BUCKET || "",
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
        },
        region: process.env.S3_REGION || "us-east-1",
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: true, // Required for Supabase Storage S3-compat
      },
    }),
  ],
  sharp: (await import("sharp")).default,
})
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: exits 0.

---

## Task 4: Wire withPayload + mount admin and API routes

**Files:** modify `next.config.mjs`. Create `app/(payload)/layout.tsx`, `app/(payload)/admin/[[...segments]]/page.tsx`, `app/(payload)/admin/[[...segments]]/not-found.tsx`, `app/(payload)/api/[...slug]/route.ts`.

- [ ] **Step 1: Wrap next.config.mjs with withPayload**

Replace `next.config.mjs` content with:
```js
import { withPayload } from "@payloadcms/next/withPayload"

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      // Supabase Storage public URL — wildcards filled in via env at deploy time.
      // Example: { protocol: "https", hostname: "<project-ref>.supabase.co", pathname: "/storage/v1/object/public/**" }
      ...(process.env.SUPABASE_PROJECT_HOST
        ? [{ protocol: "https", hostname: process.env.SUPABASE_PROJECT_HOST, pathname: "/storage/v1/object/public/**" }]
        : []),
    ],
  },
}

export default withPayload(nextConfig)
```

- [ ] **Step 2: Create the (payload) route group layout**

Create `app/(payload)/layout.tsx`:
```tsx
// The Payload admin renders its own root <html>/<body>. This layout is intentionally minimal.
import "./admin.css" // optional, can omit if not customizing

export default function PayloadLayout({ children }: { children: React.ReactNode }) {
  return children
}
```

If you don't want a custom CSS file, remove the `import` line. (Empty `app/(payload)/admin.css` is fine if you keep the import.)

- [ ] **Step 3: Mount the admin panel route**

Create `app/(payload)/admin/[[...segments]]/page.tsx`:
```tsx
import type { Metadata } from "next"
import config from "@payload-config"
import { generatePageMetadata, RootPage } from "@payloadcms/next/views"
import { importMap } from "../importMap.js"

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config, params, searchParams, importMap })

export default Page
```

- [ ] **Step 4: Create the not-found page**

Create `app/(payload)/admin/[[...segments]]/not-found.tsx`:
```tsx
import config from "@payload-config"
import { NotFoundPage } from "@payloadcms/next/views"
import { importMap } from "../importMap.js"

const NotFound = (args: { params: Promise<{ segments: string[] }>; searchParams: Promise<Record<string, string | string[]>> }) =>
  NotFoundPage({ ...args, config, importMap })

export default NotFound
```

- [ ] **Step 5: Mount the Payload REST/GraphQL API route**

Create `app/(payload)/api/[...slug]/route.ts`:
```ts
import config from "@payload-config"
import "@payloadcms/next/css"
import { REST_DELETE, REST_GET, REST_PATCH, REST_POST, REST_PUT } from "@payloadcms/next/routes"

export const GET = REST_GET(config)
export const POST = REST_POST(config)
export const DELETE = REST_DELETE(config)
export const PATCH = REST_PATCH(config)
export const PUT = REST_PUT(config)
```

- [ ] **Step 6: Generate the import map (Payload CLI)**

```bash
npx payload generate:importmap
```
Expected: creates `app/(payload)/importMap.js` referenced by the admin pages above. If the command requires DB access (some Payload versions do), skip this step until Task 6 (after the env is configured) and revisit.

- [ ] **Step 7: Single big commit for Tasks 1-4**

Stage all the Payload scaffolding work — collections, hooks, config, route mounts, next.config wrapping — and commit as one logical unit:
```bash
git add package.json package-lock.json tsconfig.json next.config.mjs src/payload src/payload.config.ts app/\(payload\)
git commit -m "feat: scaffold Payload CMS (collections, config, admin, API routes)"
```

---

## Task 5: Provision Supabase

**Files:** create `.env.example` and `.env.local`.

This task is mostly external setup (Supabase dashboard). YOU perform the dashboard steps; the plan tells you exactly what to copy where.

- [ ] **Step 1: Create a Supabase project**

Go to [supabase.com/dashboard](https://supabase.com/dashboard) → New project. Choose:
- Project name: `radule-portfolio` (or any)
- Region: closest to your users (EU-Central for Croatia/DACH; US-East for global)
- Database password: generate a strong one and save it in your password manager
- Pricing plan: Free

Wait ~2 minutes for provisioning.

- [ ] **Step 2: Copy the Postgres connection strings**

In the Supabase dashboard for the new project:
- Settings → Database → "Connection string"
- Copy the **Transaction Pooler** (port 6543) URL — this is `DATABASE_URL`. Append `?pgbouncer=true&connection_limit=1` to the end.
- Copy the **Direct connection** (port 5432) URL — this is `DATABASE_URL_DIRECT`. Used for migrations only.

Replace `[YOUR-PASSWORD]` in both with the password from Step 1.

- [ ] **Step 3: Create a storage bucket**

In the Supabase dashboard:
- Storage → New bucket → name: `portfolio-media`, **Public** ON, file size limit 10 MB, allowed MIME types: `image/*`. Save.

- [ ] **Step 4: Create S3-compatible credentials for storage**

In the Supabase dashboard:
- Storage → Settings → S3 Connection → "Enable connection" if needed → New access key. Save:
  - `Access key ID` → `S3_ACCESS_KEY_ID`
  - `Secret access key` → `S3_SECRET_ACCESS_KEY` (only shown once!)
- The S3 endpoint is shown on this page: `https://<project-ref>.supabase.co/storage/v1/s3` — that's `S3_ENDPOINT`.
- Region: in Supabase Storage Settings, displayed as e.g. `eu-central-1`. That's `S3_REGION`.

- [ ] **Step 5: Create `.env.example` (committed) and `.env.local` (NOT committed)**

`.env.example`:
```
# Postgres (Supabase) — runtime uses pooled URL, migrations use direct
DATABASE_URL=postgres://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DATABASE_URL_DIRECT=postgres://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres

# Payload — random 32+ chars
PAYLOAD_SECRET=

# Supabase Storage (S3-compatible)
S3_BUCKET=portfolio-media
S3_REGION=eu-central-1
S3_ENDPOINT=https://<project-ref>.supabase.co/storage/v1/s3
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=

# Public host used for next/image remote pattern
SUPABASE_PROJECT_HOST=<project-ref>.supabase.co
```

`.env.local` (real values, **DO NOT COMMIT**):
- Same keys, fill with the values you copied. Generate `PAYLOAD_SECRET` with `openssl rand -base64 48`.

- [ ] **Step 6: Verify `.env.local` is gitignored**

```bash
grep -E "^\\.env|\\.env\\.local|\\.env\\..+\\.local" .gitignore || echo ".env not in gitignore — add it"
```
The existing line `*.local` covers `.env.local`. If anything else, add `.env*.local` to `.gitignore`.

- [ ] **Step 7: Commit only `.env.example`**

```bash
git add .env.example .gitignore
git commit -m "chore: env template for Payload + Supabase"
```

(The plan's earlier scaffolding commit in Task 4 didn't touch the env files — `.env.local` should never appear in git history.)

---

## Task 6: First migration + bootstrap admin user

**Files:** generated `src/payload/migrations/*` (auto-created).

- [ ] **Step 1: Generate the initial migration from the schema**

YOU run:
```bash
DATABASE_URL="$DATABASE_URL_DIRECT" npx payload migrate:create initial
```
Expected: creates a file under `src/payload/migrations/<timestamp>_initial.ts` (or wherever the config places it).

- [ ] **Step 2: Apply the migration**

YOU run:
```bash
DATABASE_URL="$DATABASE_URL_DIRECT" npx payload migrate
```
Expected: applies the migration. The Supabase dashboard's "Table Editor" should now show `users`, `media`, `projects`, `posts`, plus several Payload-managed `payload_*` and `*_locales`/`*_versions` tables.

- [ ] **Step 3: Create your admin user**

YOU run:
```bash
npm run dev
```
Visit `http://localhost:3000/admin`. Payload shows a "Create First User" form because the `users` collection is empty. Fill in your email + a strong password. Submit.

- [ ] **Step 4: Verify admin login**

You should land on the admin dashboard with a sidebar showing "Content > Projects, Posts" and "Auth > Users". Click around, ensure each list view loads. Stop the dev server.

- [ ] **Step 5: Generate Payload TypeScript types**

YOU run:
```bash
npm run payload:generate:types
```
Expected: creates `src/payload-types.ts` with full types for collections, fields, etc. Used in the next tasks.

- [ ] **Step 6: Commit the generated types and any migrations**

```bash
git add src/payload-types.ts src/payload/migrations
git commit -m "feat: initial Payload migration + generated types"
```

---

## Task 7: Seed projects from existing hardcoded data

**Files:** `scripts/seed-projects.ts`.

- [ ] **Step 1: Create the seed script**

```ts
// scripts/seed-projects.ts
// Run with: npx tsx scripts/seed-projects.ts
import { getPayload } from "payload"
import config from "../src/payload.config"

const projects = [
  {
    title: "Exante Data AI Search",
    slug: "exante-data-ai-search",
    description:
      "Built a RAG-based search system that enables institutional clients to query proprietary financial datasets using natural language. Responsible for full-stack development across the React frontend, Python/FastAPI backend, PostgreSQL, and AWS infrastructure.",
    tags: [{ label: "React" }, { label: "FastAPI" }, { label: "PostgreSQL" }, { label: "AWS" }, { label: "RAG" }],
    accentColor: "#59FFCE",
    company: "Exante Data",
    role: "Full Stack Engineer",
    liveUrl: "https://ai.exantedata.com/",
    status: "published" as const,
    order: 1,
  },
  {
    title: "MarketReader Dashboard",
    slug: "marketreader-dashboard",
    description:
      "Built the platform's interactive charting system from scratch, visualizing thousands of financial data points in real-time. Owned end-to-end development of the embeddable widget system that expanded platform reach to external sites.",
    tags: [{ label: "React" }, { label: "TypeScript" }, { label: "HighCharts" }, { label: "Python" }],
    accentColor: "#B7FF03",
    company: "MarketReader",
    role: "Software Engineer",
    liveUrl: "https://app.marketreader.com/",
    status: "published" as const,
    order: 2,
  },
  {
    title: "radule.dev",
    slug: "radule-dev",
    description:
      "The site you're looking at. Custom portfolio built from scratch with a focus on performance, animation, and accessibility. Deployed via GitHub Actions CI/CD pipeline.",
    tags: [{ label: "React" }, { label: "TypeScript" }, { label: "Tailwind CSS" }, { label: "Vite" }],
    accentColor: "#59FFCE",
    liveUrl: "https://radule.dev",
    repoUrl: "https://github.com/Radule6/portfolio",
    status: "published" as const,
    order: 3,
  },
  {
    title: "Freelancer OS",
    slug: "freelancer-os",
    description:
      "An all-in-one platform for independent professionals — invoicing, project management, and client workflows in a single place. Built to replace the patchwork of tools freelancers juggle daily.",
    tags: [{ label: "Next.js" }, { label: "Supabase" }, { label: "Vercel" }],
    accentColor: "#B7FF03",
    status: "coming-soon" as const,
    order: 4,
  },
]

async function seed() {
  const payload = await getPayload({ config })

  for (const project of projects) {
    const existing = await payload.find({
      collection: "projects",
      where: { slug: { equals: project.slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`✓ ${project.slug} (already exists, skipping)`)
      continue
    }

    await payload.create({
      collection: "projects",
      data: project,
      // Don't trigger revalidation during seeding (no Next dev server running)
      context: { disableRevalidate: true },
    })
    console.log(`+ ${project.slug}`)
  }

  console.log("Done.")
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 2: Install `tsx` to run the script**

```bash
npm install --save-dev tsx
```

- [ ] **Step 3: Run the seed**

YOU run:
```bash
DATABASE_URL="$DATABASE_URL_DIRECT" npx tsx scripts/seed-projects.ts
```
Expected output:
```
+ exante-data-ai-search
+ marketreader-dashboard
+ radule-dev
+ freelancer-os
Done.
```

- [ ] **Step 4: Re-run to verify idempotence**

YOU run the same command again. Expected: all four lines now show `(already exists, skipping)`.

- [ ] **Step 5: Visit the admin and add hero images**

YOU run `npm run dev`, visit `http://localhost:3000/admin/collections/projects`. For Exante, MarketReader, and radule.dev: open each project, set `heroImage` by uploading the corresponding file from `public/projects/` (the existing PNGs). Save. Stop dev.

This is a one-time manual step because images can't be seeded without going through Payload's upload flow (which needs the bucket connection live).

- [ ] **Step 6: Commit the seed script**

```bash
git add scripts/seed-projects.ts package.json package-lock.json
git commit -m "feat: seed script for initial projects"
```

---

## Task 8: Replace hardcoded projects array with Local API query

**Files:** create `src/components/Projects/ProjectsServer.tsx`. Modify `src/components/Projects/Projects.tsx` to accept data as props instead of building it. Modify `app/page.tsx` to use the Server Component.

- [ ] **Step 1: Refactor `Projects.tsx` to accept data as props**

The current `Projects.tsx` defines a local `Project` interface and a hardcoded `projects` array inside `useMemo`. Replace the hardcoded array logic with props.

Edit `src/components/Projects/Projects.tsx`:
- Keep the `Project` interface but switch the shape to match what the Server Component will pass (basically the existing shape, plus an optional `body` for future case-study links).
- Remove the `useMemo(() => [ ... ], [])` hardcoded array.
- Add a prop `projects: Project[]` to the component signature.
- Use `props.projects` everywhere the old `projects` was referenced.
- Compute `featured` and `upcoming` from `props.projects` directly (or in `useMemo` keyed on the props).

Replace the top of the component:
```tsx
"use client";

import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { FiExternalLink, FiGithub, FiX } from "react-icons/fi";

export interface Project {
  title: string;
  slug?: string;
  description: string;
  tags: string[];
  color: string;
  status?: "coming-soon";
  image?: string;
  liveUrl?: string;
  repoUrl?: string;
  company?: string;
  role?: string;
  hasBody?: boolean;
}

const Projects: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [modalProject, setModalProject] = useState<Project | null>(null);
  // ... rest unchanged
```

Then delete the entire hardcoded array `const projects: Project[] = useMemo(() => [...], [])`. Keep the rest of the component unchanged.

If the existing card markup links to a case-study page, update the title to a `<Link>` only when `hasBody` is true (anticipating Task 9). Otherwise leave non-clickable.

- [ ] **Step 2: Create `ProjectsServer.tsx` Server Component**

```tsx
// src/components/Projects/ProjectsServer.tsx
import { getPayload } from "payload"
import config from "@payload-config"
import Projects, { type Project } from "./Projects"

export default async function ProjectsServer() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: "projects",
    where: { status: { not_equals: "draft" } },
    sort: "order",
    depth: 1, // populate heroImage relation
    limit: 50,
  })

  const projects: Project[] = docs.map((doc) => {
    const hero = typeof doc.heroImage === "object" && doc.heroImage !== null ? doc.heroImage : null
    return {
      title: doc.title,
      slug: doc.slug,
      description: doc.description,
      tags: (doc.tags ?? []).map((t) => t.label),
      color: doc.accentColor,
      status: doc.status === "coming-soon" ? "coming-soon" : undefined,
      image: hero?.url ?? undefined,
      liveUrl: doc.liveUrl ?? undefined,
      repoUrl: doc.repoUrl ?? undefined,
      company: doc.company ?? undefined,
      role: doc.role ?? undefined,
      hasBody: Boolean(doc.body),
    }
  })

  return <Projects projects={projects} />
}
```

- [ ] **Step 3: Update `app/page.tsx` to use the Server Component**

Edit `app/page.tsx`, swap import:
```tsx
import ProjectsServer from "@/components/Projects/ProjectsServer"
// ...
<main>
  <Hero />
  <About />
  <ProjectsServer />
  <Contact />
</main>
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```
Expected: exits 0.

- [ ] **Step 5: YOU run the build to verify the page generates with real data**

```bash
npm run build
```
Expected: build succeeds. The build output should show `/` is `static` (from cache) since the projects are fetched at build time.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx src/components/Projects
git commit -m "feat: drive homepage projects section from Payload Local API"
```

---

## Task 9: Project case-study pages — `/projects/[slug]`

**Files:** create `app/(frontend)/layout.tsx` (move existing layout structure here), `app/(frontend)/projects/[slug]/page.tsx`. Create `src/components/RichText/RichText.tsx`. Move `app/page.tsx` → `app/(frontend)/page.tsx`.

- [ ] **Step 1: Restructure routes into the (frontend) group**

Move the existing public routes into a `(frontend)` group so they're isolated from the Payload admin's layout:
```bash
mkdir -p app/\(frontend\)
git mv app/page.tsx app/\(frontend\)/page.tsx
```

Note: `app/layout.tsx` (the root layout) and `app/globals.css` stay at the top level — they apply to everything.

- [ ] **Step 2: Create the Lexical → React renderer**

```tsx
// src/components/RichText/RichText.tsx
import { RichText as PayloadRichText } from "@payloadcms/richtext-lexical/react"
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical"

export default function RichText({ data }: { data: SerializedEditorState | undefined | null }) {
  if (!data) return null
  return (
    <div className="prose prose-invert max-w-none [&_h2]:font-display [&_h3]:font-display [&_a]:text-accent-lime hover:[&_a]:text-accent-yellow">
      <PayloadRichText data={data} />
    </div>
  )
}
```

This uses Payload's official React renderer for Lexical. Tailwind `prose` classes aren't built-in to v4 — if you want richer typography, run `npm install @tailwindcss/typography` and add it to `app/globals.css` as `@plugin "@tailwindcss/typography";`. Otherwise the manual class overrides above are minimal but adequate.

- [ ] **Step 3: Create `/projects/[slug]/page.tsx`**

```tsx
// app/(frontend)/projects/[slug]/page.tsx
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Image from "next/image"
import { getPayload } from "payload"
import config from "@payload-config"
import { siteConfig } from "@/lib/site-config"
import RichText from "@/components/RichText/RichText"
import Navigation from "@/components/Navigation/Navigation"
import Footer from "@/components/Footer/Footer"

type Params = { slug: string }

export async function generateStaticParams(): Promise<Params[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "projects",
    where: { status: { equals: "published" } },
    limit: 100,
    depth: 0,
  })
  return docs.filter((d) => d.body).map((d) => ({ slug: d.slug }))
}

async function getProject(slug: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "projects",
    where: { slug: { equals: slug }, status: { not_equals: "draft" } },
    limit: 1,
    depth: 2, // hero, gallery, seo.ogImage all populate
  })
  return docs[0] ?? null
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) return {}
  const hero = typeof project.heroImage === "object" ? project.heroImage : null
  const ogFromSeo = typeof project.seo?.ogImage === "object" ? project.seo.ogImage : null
  const ogImage = ogFromSeo?.url ?? hero?.url ?? siteConfig.ogImage
  return {
    title: project.seo?.title ?? project.title,
    description: project.seo?.description ?? project.description,
    alternates: { canonical: `${siteConfig.url}/projects/${project.slug}` },
    openGraph: {
      type: "article",
      url: `${siteConfig.url}/projects/${project.slug}`,
      title: project.seo?.title ?? project.title,
      description: project.seo?.description ?? project.description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: project.seo?.title ?? project.title,
      description: project.seo?.description ?? project.description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project || !project.body) notFound()

  const hero = typeof project.heroImage === "object" ? project.heroImage : null

  return (
    <div className="bg-surface min-h-screen">
      <Navigation />
      <main className="px-6 sm:px-10 lg:px-16 py-20 sm:py-28 max-w-4xl mx-auto">
        <div className="mb-8">
          <span className="font-body text-xs tracking-[0.3em] uppercase text-text-muted">
            {project.company ?? "Project"}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-800 tracking-tight text-text-primary mt-3">
            {project.title}
          </h1>
          {project.role && project.company && (
            <p className="font-body text-text-secondary mt-3">
              {project.role} · {project.company}
            </p>
          )}
        </div>

        {hero?.url && (
          <div className="rounded-2xl overflow-hidden border border-border mb-10">
            <Image
              src={hero.url}
              alt={hero.alt ?? `${project.title} hero image`}
              width={hero.width ?? 1905}
              height={hero.height ?? 937}
              sizes="(min-width: 1024px) 896px, 100vw"
              className="w-full h-auto"
              priority
            />
          </div>
        )}

        <RichText data={project.body} />

        <div className="mt-12 flex flex-wrap gap-3">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-sm border border-border rounded-full px-4 py-2 text-text-secondary hover:text-text-primary hover:border-border-hover transition-all"
            >
              View live site
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-sm border border-border rounded-full px-4 py-2 text-text-secondary hover:text-text-primary hover:border-border-hover transition-all"
            >
              Source
            </a>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

// Allow dynamic params (slugs not in generateStaticParams) to fall back to ISR.
export const dynamicParams = true
```

- [ ] **Step 4: Update `Projects.tsx` to link to case-study pages when `hasBody` is true**

In the existing card markup (around the project title `<h3>`), wrap it conditionally:
```tsx
{project.hasBody && project.slug ? (
  <Link href={`/projects/${project.slug}`} className="hover:text-accent-lime transition-colors">
    <h3 className="...">{project.title}</h3>
  </Link>
) : (
  <h3 className="...">{project.title}</h3>
)}
```

Add `import Link from "next/link"` at the top of `Projects.tsx`.

- [ ] **Step 5: Set hero image dimensions through Payload's media metadata**

The `Image` component above uses `hero.width` and `hero.height`. Payload's `Media` collection automatically captures these via Sharp. No code change needed — but verify by visiting `/admin/collections/media` and confirming uploaded images show width/height.

- [ ] **Step 6: Type-check**

```bash
npx tsc --noEmit
```
Expected: exits 0.

- [ ] **Step 7: YOU run build, then verify case-study pages render**

```bash
npm run build
```
Expected: at least one `/projects/<slug>` route shows up in the route summary if any seeded project has a `body`. (Right now none do, since the seed only set strings — that's expected. Test by going to `/admin`, opening one project, filling in a Lexical body, saving, then re-running build.)

YOU then run `npm run dev`, edit a project's `body` in the admin, save. Visit `/projects/<that-slug>` and confirm it renders the rich text. The homepage should also re-render with that title now linked.

- [ ] **Step 8: Commit**

```bash
git add app src/components/Projects src/components/RichText
git commit -m "feat: project case-study pages with Lexical body and ISR revalidation"
```

---

## Task 10: Final verification and pre-Plan-3 checkpoint

**Files:** none.

- [ ] **Step 1: Static checks**

```bash
npx tsc --noEmit
npm run lint
```
Both must exit 0 (warnings allowed in lint).

- [ ] **Step 2: YOU run `npm run build` — must succeed**

Verify the route summary shows:
- `/` (static)
- `/admin/[[...segments]]` (dynamic / SSR — Payload manages it)
- `/api/[...slug]` (dynamic)
- `/projects/[slug]` (static for any project with a body, dynamic fallback otherwise)

- [ ] **Step 3: YOU run `npm run dev` and verify end-to-end**

Visit `http://localhost:3000`:
- Projects section shows the 4 seeded entries (and any case studies you've added).
- A project with a `body` is now a clickable title.

Visit `http://localhost:3000/admin`:
- Sign in as your admin user.
- Edit a project (change the `description`). Save.
- Within ~30 seconds (after Next.js's revalidation kicks in), `/` shows the new description.

- [ ] **Step 4: Confirm the working tree is clean**

```bash
git status
```
Expected: clean.

- [ ] **Step 5: Tag the commit point so it's easy to roll back to if Plan 3 breaks**

```bash
git tag plan-2-complete
```

(Local tag only. Push it with `git push origin plan-2-complete` if you want it on GitHub.)

---

## Out of Scope for Plan 2 (later plans)

- **Vercel project + GitHub Actions deploy gate** — Plan 3
- **Public `/blog` listing and `/blog/[slug]` post page** — Plan 4
- **RSS feed at `/feed.xml`** — Plan 4
- **DNS cutover from Hostinger to Vercel** — Plan 5
- **Adding `next/image` remote pattern verification on Vercel** — Plan 3 (env var must be set there)

---

## Definition of Done

- All 10 tasks completed.
- Locally: `npm run build` succeeds; `npm run dev` works; admin login works; editing a project triggers homepage revalidation.
- Supabase shows project rows in the `projects` table and uploaded images in the `portfolio-media` bucket.
- The homepage and case-study pages render real content fetched from Payload.
- Branch `next-js-migration` history shows ~7 logical commits added during Plan 2.
- `plan-2-complete` git tag set.
- No TypeScript errors, no remaining hardcoded project data in `Projects.tsx`.

When this is true, request a code review (`superpowers:requesting-code-review`) before starting Plan 3.
