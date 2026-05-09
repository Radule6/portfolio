// Run with:
//   npx tsx scripts/seed-projects.ts
//
// Loads env via @next/env (same loader Next.js uses), so .env.local is picked
// up automatically. If you want to override DATABASE_URL with the direct
// connection string, prefix the command:
//   DATABASE_URL="$DATABASE_URL_DIRECT" npx tsx scripts/seed-projects.ts
//
// Idempotent: re-running skips projects that already exist (matched by slug).
// To refresh seed content with new schema fields, delete the project rows in
// /admin first and re-run.
import nextEnv from "@next/env"

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd())

// Dynamic imports — must run AFTER env is loaded because payload.config.ts
// reads process.env.PAYLOAD_SECRET at module load time.
const { getPayload } = await import("payload")
const config = (await import("../src/payload.config")).default

const placeholderLexical = (paragraphs: string[]) => ({
  root: {
    type: "root" as const,
    direction: "ltr" as const,
    format: "" as const,
    indent: 0,
    version: 1,
    children: paragraphs.map((text) => ({
      type: "paragraph" as const,
      direction: "ltr" as const,
      format: "" as const,
      indent: 0,
      version: 1,
      children: [
        {
          type: "text" as const,
          text,
          version: 1,
          format: 0,
          mode: "normal" as const,
          style: "",
          detail: 0,
        },
      ],
    })),
  },
})

const projects = [
  {
    title: "Exante Data AI Search",
    slug: "exante-data-ai-search",
    description:
      "Built a RAG-based search system that enables institutional clients to query proprietary financial datasets using natural language. Responsible for full-stack development across the React frontend, Python/FastAPI backend, PostgreSQL, and AWS infrastructure.",
    problem: placeholderLexical([
      "Phase 1 placeholder. Real case-study copy will land in a separate content task.",
    ]),
    approach: placeholderLexical([
      "Phase 1 placeholder. Real case-study copy will land in a separate content task.",
    ]),
    tags: [
      { label: "React" },
      { label: "FastAPI" },
      { label: "PostgreSQL" },
      { label: "AWS" },
      { label: "RAG" },
    ],
    accentColor: "#59FFCE",
    company: "Exante Data",
    role: "Full Stack Engineer",
    liveUrl: "https://ai.exantedata.com/",
    status: "published" as const,
    lifecycle: "live" as const,
    dateBuilt: "2024-09-01",
    order: 1,
  },
  {
    title: "MarketReader Dashboard",
    slug: "marketreader-dashboard",
    description:
      "Built the platform's interactive charting system from scratch, visualizing thousands of financial data points in real-time. Owned end-to-end development of the embeddable widget system that expanded platform reach to external sites.",
    problem: placeholderLexical([
      "Phase 1 placeholder. Real case-study copy will land in a separate content task.",
    ]),
    approach: placeholderLexical([
      "Phase 1 placeholder. Real case-study copy will land in a separate content task.",
    ]),
    tags: [
      { label: "React" },
      { label: "TypeScript" },
      { label: "HighCharts" },
      { label: "Python" },
    ],
    accentColor: "#B7FF03",
    company: "MarketReader",
    role: "Software Engineer",
    liveUrl: "https://app.marketreader.com/",
    status: "published" as const,
    lifecycle: "live" as const,
    dateBuilt: "2023-04-01",
    order: 2,
  },
  {
    title: "radule.dev",
    slug: "radule-dev",
    description:
      "The site you're looking at. Custom portfolio built from scratch with a focus on performance, animation, and accessibility.",
    problem: placeholderLexical([
      "Phase 1 placeholder. Real case-study copy will land in a separate content task.",
    ]),
    approach: placeholderLexical([
      "Phase 1 placeholder. Real case-study copy will land in a separate content task.",
    ]),
    tags: [
      { label: "React" },
      { label: "Next.js" },
      { label: "TypeScript" },
      { label: "Tailwind CSS" },
      { label: "Payload" },
    ],
    accentColor: "#59FFCE",
    liveUrl: "https://radule.dev",
    repoUrl: "https://github.com/Radule6/portfolio",
    status: "published" as const,
    lifecycle: "live" as const,
    dateBuilt: "2026-04-01",
    order: 3,
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
      const current = existing.docs[0]
      const patch: Record<string, unknown> = {}
      if (!current.problem && project.problem) patch.problem = project.problem
      if (!current.approach && project.approach) patch.approach = project.approach
      if (!current.dateBuilt && project.dateBuilt) patch.dateBuilt = project.dateBuilt
      if (Object.keys(patch).length === 0) {
        console.log(`✓ ${project.slug} (already exists, no patch needed)`)
      } else {
        await payload.update({
          collection: "projects",
          id: current.id,
          data: patch,
          context: { disableRevalidate: true },
        })
        console.log(`~ ${project.slug} (patched: ${Object.keys(patch).join(", ")})`)
      }
      continue
    }

    await payload.create({
      collection: "projects",
      data: project,
      // No Next dev server during seed — skip revalidation hooks.
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
