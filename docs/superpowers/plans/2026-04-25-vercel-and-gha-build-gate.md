# Plan 3 — Vercel Deploy + GitHub Actions Build Gate

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a Vercel project for this app, disable Vercel's git auto-deploy, and add a GitHub Actions workflow that runs lint + typecheck + build on every push/PR. Only when all of those pass does the workflow call the Vercel CLI to deploy. A failing build can never reach Vercel.

**Architecture:** One Vercel project, `radule-portfolio` (or whatever name you pick). Domains added later in Plan 5 (DNS cutover). The workflow uses the official Vercel CLI flow — `vercel pull` (downloads env + project metadata), `vercel build --prebuilt` (compiles locally inside GHA), then `vercel deploy --prebuilt` (uploads the prebuilt artifact). Production deploys only on `main`; PRs and branches get preview URLs.

**Tech Stack:** GitHub Actions, Vercel CLI, Node 22 (matches local), npm.

**Spec:** `docs/superpowers/specs/2026-04-25-nextjs-migration-design.md` §9 (updated to include the GHA gate).

**Branch:** `next-js-migration` (continuing from Plan 1 + 2).

---

## File Map

### Created
- `.github/workflows/deploy.yml` — main workflow, the build gate.
- `vercel.json` (optional, only if needed) — Vercel project config.

### Modified
- `package.json` — make sure `lint` / `typecheck` / `build` scripts run cleanly with no errors.
- Source files with current ESLint errors (see Task 1) — fixed.

### Deleted
- `.github/workflows/deploy.yml` if it's the old Hostinger FTP one — replaced wholesale (Plan 5 deletes any other Hostinger-only artifacts).

---

## Prerequisites — what YOU need ready (none upfront)

The plan walks you through Vercel signup and GitHub secrets at the right step. Don't do anything in advance.

---

## Verification model

Same as previous plans:
- TypeScript: `npx tsc --noEmit` exits 0
- Lint: `npm run lint` exits 0 (warnings allowed, errors not)
- Build: **YOU run** `npm run build` and confirm success
- GHA verification: push the branch, open the Actions tab on GitHub, watch the workflow run

---

## Task 1: Fix outstanding ESLint errors

**Files:** `src/components/ThemeToggle/ThemeToggle.tsx`, `src/components/CommandPalette/CommandPalette.tsx`, `src/components/CommandPalette/TerminalMode.tsx`, `src/components/CommandPalette/AsciiAnimation.tsx`. Possibly add `dist/**` to ESLint ignores if the legacy Vite output is still around.

The build gate will run `npm run lint` and fail if there are errors. Right now there are 8 errors (mostly `react-hooks/set-state-in-effect` and `react-hooks/refs` from React 19's stricter rules). Fix or selectively disable.

- [ ] **Step 1: Confirm the current error list**

```bash
npm run lint 2>&1 | grep -E "  error " | head -30
```
Expected: a list of files and line numbers. Cross-reference with the items below.

- [ ] **Step 2: Fix `ThemeToggle.tsx` (line ~11) — `useEffect(() => setMounted(true), [])`**

Replace the `mounted`/`useEffect` pattern with `useSyncExternalStore` (React 19's hydration-safe primitive for "is this on the client yet").

Add a `src/lib/use-is-client.ts` helper:
```ts
"use client"
import { useSyncExternalStore } from "react"

const subscribe = () => () => {}
const getServerSnapshot = () => false
const getSnapshot = () => true

/**
 * Returns false during SSR and the initial client render, then true after
 * hydration. Useful for components that must render different markup
 * post-hydration (theme toggles, OS-specific shortcuts) without setState
 * inside an effect.
 */
export function useIsClient() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
```

Then in `ThemeToggle.tsx`, replace:
```ts
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
```
with:
```ts
const mounted = useIsClient()
```
(plus `import { useIsClient } from "@/lib/use-is-client"` and remove the now-unused `useEffect` / `useState` imports if nothing else uses them).

- [ ] **Step 3: Fix `CommandPalette.tsx` `CommandPaletteTrigger` (the shortcut label `setShortcutLabel` effect)**

Same pattern. Replace the `useState`/`useEffect` for `shortcutLabel` with:
```ts
const isClient = useIsClient()
const isMac = isClient && /Mac|iPhone|iPad/.test(navigator.userAgent)
const shortcutLabel = isMac ? "⌘K" : "Ctrl+K"
```

- [ ] **Step 4: Fix the remaining `set-state-in-effect` errors in `CommandPalette.tsx` (lines 112, 204, 459) and `TerminalMode.tsx` (line 78)**

Read the lint output for each. The fix per case:
- If the effect runs once on mount and just sets state from a derived value, replace with `useSyncExternalStore`, `useMemo`, or by computing the value at render time.
- If the effect calls setState in response to a prop change, use a "key change" pattern (computed during render) instead of an effect.
- If the effect is genuinely synchronizing with an external system (e.g., `addEventListener` plus its cleanup), the rule is overzealous — you can disable just that line: `// eslint-disable-next-line react-hooks/set-state-in-effect`.

Use the disable comment sparingly and only where the effect is clearly an external-system sync (not a derived-state computation).

- [ ] **Step 5: Fix `AsciiAnimation.tsx` (lines 130, 134) — `react-hooks/refs`: "Cannot access refs during render"**

Open the file and find the ref usages on those lines. The rule fires when you write to or read `.current` on a ref during the render phase (i.e., outside `useEffect` / event handlers). Move that access into a `useEffect` or initialize the ref inline at declaration time.

If the existing pattern is `const onCompleteRef = useRef(onComplete)` followed by `onCompleteRef.current = onComplete` outside an effect, refactor to:
```ts
const onCompleteRef = useRef(onComplete)
useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])
```

- [ ] **Step 6: Re-run lint and typecheck**

```bash
npm run lint 2>&1 | grep "error" | head -10
npx tsc --noEmit
```
Expected: 0 errors from lint (warnings OK), tsc exits 0.

- [ ] **Step 7: Commit Task 1 as a single commit**

```bash
git add -A
git commit -m "refactor: fix React 19 react-hooks/* errors via useSyncExternalStore"
```

---

## Task 2: Vercel project setup (YOU do this in the Vercel UI)

**Files:** none in this repo.

- [ ] **Step 1: Create a Vercel account if you don't have one**

[vercel.com/signup](https://vercel.com/signup). Free Hobby plan is fine.

- [ ] **Step 2: Connect your GitHub account**

In Vercel → Settings → Git Integration → Install GitHub App. Grant access to the `Radule6/portfolio` repo (or whatever the repo's name is — `Radule6/web-portfolio` from `repoUrl` in your projects).

- [ ] **Step 3: Import the project but DON'T deploy yet**

Vercel Dashboard → Add New → Project → select your `web-portfolio` repo. On the configuration screen:
- Framework preset: **Next.js** (auto-detected)
- Build command: leave default (`next build`)
- Output directory: leave default
- Install command: leave default (`npm ci`)
- **Important:** under "Environment Variables", paste in the same values from your `.env.local` (DATABASE_URL, DATABASE_URL_DIRECT, PAYLOAD_SECRET, S3_BUCKET, S3_REGION, S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, SUPABASE_PROJECT_HOST). Set each for **Production, Preview, Development** (all three checkboxes).
- Click **Deploy**. The first deploy will run; that's expected — it sets up the project. We'll disable auto-deploy in the next step.

- [ ] **Step 4: Disable Vercel's git auto-deploy**

Settings → Git → "Ignored Build Step" → set to:
```bash
echo "Skipping auto-build — GHA handles deploys via prebuilt." && exit 0
```
That returns 0 (skip silently) for every git event. Now Vercel will only deploy when GHA explicitly invokes the CLI.

(Alternative: under Settings → Git, toggle off "Production Branch deploys" and "Preview deploys". Either approach works; the ignored-build-step is more flexible since you can re-enable later by setting it to `exit 1`.)

- [ ] **Step 5: Capture the IDs you'll need for GHA**

In your Vercel project Settings → General, scroll to find:
- **Project ID** (looks like `prj_xxxxxxxxxxxx`) → save as `VERCEL_PROJECT_ID`
- **Team / Org ID** (looks like `team_xxxxxxxxxxxx` or your personal user ID) → save as `VERCEL_ORG_ID`

Then go to your account avatar → Account Settings → Tokens → "Create" → name `radule-portfolio-gha`, scope to your team if relevant, expiry: pick something long (1 year or never). Save the resulting token as `VERCEL_TOKEN`.

---

## Task 3: Add GHA secrets

**Files:** none in repo (GitHub UI only).

- [ ] **Step 1: Add the three Vercel secrets to GitHub**

Repo → Settings → Secrets and variables → Actions → New repository secret. Add:
- `VERCEL_TOKEN` = the token from Task 2 step 5
- `VERCEL_ORG_ID` = the org ID from Task 2 step 5
- `VERCEL_PROJECT_ID` = the project ID from Task 2 step 5

That's all GHA needs — Vercel CLI uses these to authenticate, identify the project, and pull the env vars from Vercel itself (so we don't duplicate the Supabase secrets in GHA).

- [ ] **Step 2: Confirm secrets are present**

Repo → Settings → Secrets and variables → Actions. The three names should appear (values are hidden). If only one is there, you missed two.

---

## Task 4: Write the GitHub Actions workflow

**Files:** `.github/workflows/deploy.yml`.

- [ ] **Step 1: Replace any existing deploy.yml**

If `.github/workflows/deploy.yml` still exists from the old Hostinger FTP setup, overwrite it. If it doesn't exist, create it.

```yaml
name: Build and deploy to Vercel

on:
  push:
    branches: ["**"]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  ci:
    name: Lint, typecheck, build
    runs-on: ubuntu-latest
    timeout-minutes: 15
    outputs:
      passed: ${{ steps.gate.outputs.passed }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npm run typecheck

      - name: Build
        run: npm run build
        env:
          # Build needs at minimum DATABASE_URL + PAYLOAD_SECRET to compile —
          # Vercel pulls real values during deploy. For the CI build we read
          # placeholder values from GitHub secrets so getPayload() doesn't crash.
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          DATABASE_URL_DIRECT: ${{ secrets.DATABASE_URL_DIRECT }}
          PAYLOAD_SECRET: ${{ secrets.PAYLOAD_SECRET }}
          S3_BUCKET: ${{ secrets.S3_BUCKET }}
          S3_REGION: ${{ secrets.S3_REGION }}
          S3_ENDPOINT: ${{ secrets.S3_ENDPOINT }}
          S3_ACCESS_KEY_ID: ${{ secrets.S3_ACCESS_KEY_ID }}
          S3_SECRET_ACCESS_KEY: ${{ secrets.S3_SECRET_ACCESS_KEY }}
          SUPABASE_PROJECT_HOST: ${{ secrets.SUPABASE_PROJECT_HOST }}

      - name: Mark gate passed
        id: gate
        run: echo "passed=true" >> $GITHUB_OUTPUT

  deploy-preview:
    name: Deploy preview
    needs: ci
    if: github.event_name == 'pull_request' || (github.event_name == 'push' && github.ref != 'refs/heads/main')
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      - name: Pull Vercel env (preview)
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
      - name: Build for Vercel
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy preview
        run: vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}

  deploy-production:
    name: Deploy production
    needs: ci
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      - name: Pull Vercel env (production)
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      - name: Build for Vercel (prod)
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy production
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

Key behaviors:
- `ci` job runs on every push and PR. If lint/typecheck/build fails, neither deploy job runs.
- `deploy-preview` runs only for non-main pushes and PRs.
- `deploy-production` runs only for pushes to `main`.
- Deploy jobs `needs: ci` — they're blocked until CI passes.
- Vercel CLI uses `vercel pull` to fetch project env vars from Vercel (no duplication of secrets needed for the deploy step itself).

- [ ] **Step 2: Add the env-var GitHub secrets the build step needs**

The `Build` step in the `ci` job needs the same env vars as your local build to compile. Add these GitHub repo secrets (Settings → Secrets → Actions) with the same values as `.env.local`:
- `DATABASE_URL`
- `DATABASE_URL_DIRECT`
- `PAYLOAD_SECRET`
- `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
- `SUPABASE_PROJECT_HOST`

Note: these are duplicated between Vercel (for runtime) and GHA (for build-time CI). Some teams use GitHub environments to centralize, but for a personal portfolio this duplication is fine.

- [ ] **Step 3: Commit the workflow + any related changes from Tasks 2-3**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: GitHub Actions build gate, deploy to Vercel only on success"
```

---

## Task 5: Push and verify the gate

**Files:** none.

- [ ] **Step 1: Push the branch**

```bash
git push -u origin next-js-migration
```

- [ ] **Step 2: Watch the workflow run**

Open the repo on GitHub → Actions tab. The workflow should appear as "in progress." Watch the `ci` job — it should run lint → typecheck → build, all green. Then `deploy-preview` runs (since this isn't `main`). At the end, Vercel CLI prints a preview URL.

- [ ] **Step 3: Visit the preview URL and smoke-test**

Open the URL Vercel CLI printed (something like `https://web-portfolio-xxxxx.vercel.app`). Verify:
- Homepage `/` loads with the four projects from Payload (now reading from Supabase via Vercel's env vars).
- `/admin` loads (you may need to create a fresh admin user since Vercel preview is a different deployment context, but data persists in Supabase). If your admin user works, log in and verify projects are listed.
- Browser console clean (no hydration errors).

If the preview URL works, the deploy gate works.

- [ ] **Step 4: Test the "fail" case — confirm a broken build does NOT deploy**

```bash
# Introduce a deliberate TypeScript error
echo 'export const broken: number = "not a number"' >> src/components/Hero/Hero.tsx
git commit -am "test: deliberately break typecheck"
git push
```

Watch GHA. The `ci` job should fail at the `Typecheck` step. The deploy jobs should be skipped (you'll see `Skipped` next to them). Vercel deployment count for the project should NOT increase.

Then revert:
```bash
git reset --hard HEAD~1
git push --force-with-lease
```
(force-push is fine here; this is a feature branch, not main.)

---

## Task 6: Final verification

**Files:** none.

- [ ] **Step 1: One more clean build locally**

YOU run:
```bash
npm run lint
npm run typecheck
npm run build
```
All three exit 0. Catches anything that GHA might have papered over (e.g., env-dependent build behavior).

- [ ] **Step 2: Tag the commit**

```bash
git tag plan-3-complete
```

(Optional `git push origin plan-3-complete` to publish the tag.)

---

## Out of Scope for Plan 3 (later plans)

- `/blog` listing + RSS feed — Plan 4
- DNS cutover from Hostinger to `radule.dev` → Vercel — Plan 5
- Deleting any old Hostinger artifacts — Plan 5

---

## Definition of Done

- All 6 tasks completed.
- A push to `next-js-migration` triggers GHA, which runs lint/typecheck/build, and on success deploys a preview to Vercel.
- A push with a deliberate failure does NOT deploy.
- Preview URL serves the same site that runs locally, with projects from Payload, working admin, no console errors.
- Branch history shows ~3-4 logical commits added during Plan 3.
- `plan-3-complete` git tag set.
- GitHub repo secrets visible: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, plus the env-var build secrets.
- Vercel project's "Ignored Build Step" set so git auto-deploy is bypassed.

When this is true, you have a working CI/CD pipeline that gates Vercel on a passing build. Plan 4 (blog) and Plan 5 (DNS cutover) can follow in any order.
