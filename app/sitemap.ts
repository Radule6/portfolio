import type { MetadataRoute } from "next"
import { getPayload } from "payload"
import config from "@payload-config"
import { siteConfig } from "@/lib/site-config"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })

  const [postsResult, projectsResult] = await Promise.all([
    payload.find({
      collection: "posts",
      where: { status: { equals: "published" } },
      limit: 1000,
      depth: 0,
      sort: "-publishedAt",
    }),
    payload.find({
      collection: "projects",
      where: { status: { equals: "published" } },
      limit: 1000,
      depth: 0,
      sort: "-publishedAt",
    }),
  ])

  const now = new Date()

  return [
    {
      url: siteConfig.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...projectsResult.docs.map((p) => ({
      url: `${siteConfig.url}/projects/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...postsResult.docs.map((p) => ({
      url: `${siteConfig.url}/blog/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ]
}
