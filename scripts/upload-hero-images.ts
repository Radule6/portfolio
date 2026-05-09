// One-off: uploads placeholder hero images to the Payload `media` collection
// (which routes to Supabase Storage via the s3Storage plugin) and attaches
// each to the matching project. Skips projects that already have a heroImage.
//
// Run with:
//   npx tsx scripts/upload-hero-images.ts
//
// Replace the URLs below with real screenshots when you have them, or do
// per-project hero uploads in /admin.
import nextEnv from "@next/env"

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd())

const { getPayload } = await import("payload")
const config = (await import("../src/payload.config")).default

const heroes: Array<{ slug: string; url: string; alt: string }> = [
  {
    slug: "exante-data-ai-search",
    url: "https://placehold.co/1905x937/0a0a0a/59FFCE/png?text=Exante+Data+AI+Search&font=montserrat",
    alt: "Exante Data AI Search dashboard",
  },
  {
    slug: "marketreader-dashboard",
    url: "https://placehold.co/1905x937/0a0a0a/B7FF03/png?text=MarketReader+Dashboard&font=montserrat",
    alt: "MarketReader dashboard charting interface",
  },
  {
    slug: "radule-dev",
    url: "https://placehold.co/1905x937/0a0a0a/FFFF00/png?text=radule.dev&font=montserrat",
    alt: "radule.dev portfolio site",
  },
]

async function run() {
  const payload = await getPayload({ config })

  for (const h of heroes) {
    const { docs } = await payload.find({
      collection: "projects",
      where: { slug: { equals: h.slug } },
      limit: 1,
      depth: 0,
    })
    if (docs.length === 0) {
      console.log(`✗ ${h.slug} (project not found, skipping)`)
      continue
    }
    const project = docs[0]
    if (project.heroImage) {
      console.log(`✓ ${h.slug} (already has hero, skipping)`)
      continue
    }

    const res = await fetch(h.url)
    if (!res.ok) {
      console.log(`✗ ${h.slug} (fetch failed: ${res.status} ${res.statusText})`)
      continue
    }
    const buf = Buffer.from(await res.arrayBuffer())

    const media = await payload.create({
      collection: "media",
      data: { alt: h.alt },
      file: {
        data: buf,
        mimetype: "image/png",
        name: `${h.slug}-hero.png`,
        size: buf.length,
      },
    })

    await payload.update({
      collection: "projects",
      id: project.id,
      data: { heroImage: media.id },
      // Skip revalidate hooks during the seed — no Next dev server attached.
      context: { disableRevalidate: true },
    })

    console.log(`+ ${h.slug} hero uploaded (media id ${media.id})`)
  }

  console.log("Done.")
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
