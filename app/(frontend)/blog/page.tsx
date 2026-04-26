import type { Metadata } from "next"
import { getPayload } from "payload"
import config from "@payload-config"
import { siteConfig } from "@/lib/site-config"
import Navigation from "@/components/Navigation/Navigation"
import Footer from "@/components/Footer/Footer"
import BlogList from "@/components/Blog/BlogList"

const POSTS_PER_PAGE = 10

const blogDescription =
  "Notes on AI engineering, full-stack development, and the tools I build with."

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}): Promise<Metadata> {
  const { page } = await searchParams
  const n = Math.max(1, Number(page) || 1)
  const suffix = n > 1 ? ` · Page ${n}` : ""
  const canonical = n > 1 ? `${siteConfig.url}/blog?page=${n}` : `${siteConfig.url}/blog`
  return {
    title: `Blog${suffix}`,
    description: blogDescription,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: `${siteConfig.url}/blog`,
      title: `Blog · ${siteConfig.name}`,
      description: blogDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: `Blog · ${siteConfig.name}`,
      description: blogDescription,
    },
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: "posts",
    where: { status: { equals: "published" } },
    sort: "-publishedAt",
    limit: POSTS_PER_PAGE,
    page,
    depth: 2,
  })

  return (
    <div className="bg-surface min-h-screen">
      <Navigation />
      <main>
        <BlogList docs={result.docs} page={page} totalPages={result.totalPages} />
      </main>
      <Footer />
    </div>
  )
}
