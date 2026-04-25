// Run with:
//   DATABASE_URL="$DATABASE_URL_DIRECT" npx tsx scripts/seed-projects.ts
//
// Idempotent: re-running skips projects that already exist (matched by slug).
import { getPayload } from "payload"
import config from "../src/payload.config"

const projects = [
  {
    title: "Exante Data AI Search",
    slug: "exante-data-ai-search",
    description:
      "Built a RAG-based search system that enables institutional clients to query proprietary financial datasets using natural language. Responsible for full-stack development across the React frontend, Python/FastAPI backend, PostgreSQL, and AWS infrastructure.",
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
    order: 1,
  },
  {
    title: "MarketReader Dashboard",
    slug: "marketreader-dashboard",
    description:
      "Built the platform's interactive charting system from scratch, visualizing thousands of financial data points in real-time. Owned end-to-end development of the embeddable widget system that expanded platform reach to external sites.",
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
    order: 2,
  },
  {
    title: "radule.dev",
    slug: "radule-dev",
    description:
      "The site you're looking at. Custom portfolio built from scratch with a focus on performance, animation, and accessibility.",
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
      console.log(`✓ ${project.slug} (already exists, skipping)`)
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
