import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getPayload } from "payload"
import config from "@payload-config"
import { siteConfig } from "@/lib/site-config"
import Navigation from "@/components/Navigation/Navigation"
import Footer from "@/components/Footer/Footer"
import BlogPost from "@/components/Blog/BlogPost"
import { extractToc } from "@/lib/blog-toc"
import type { Media } from "@/payload-types"

type Params = { slug: string }

export async function generateStaticParams(): Promise<Params[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "posts",
    where: { status: { equals: "published" } },
    limit: 1000,
    depth: 0,
  })
  return docs.map((d) => ({ slug: d.slug }))
}

export const dynamicParams = true

async function getPost(slug: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: "posts",
    where: {
      slug: { equals: slug },
      status: { equals: "published" },
    },
    limit: 1,
    depth: 2,
  })
  return docs[0] ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}

  const cover = typeof post.coverImage === "object" ? (post.coverImage as Media) : null
  const seoOg = typeof post.seo?.ogImage === "object" ? (post.seo?.ogImage as Media) : null
  const ogImage = seoOg?.url ?? cover?.url ?? siteConfig.ogImage
  const title = post.seo?.title ?? post.title
  const description = post.seo?.description ?? post.excerpt
  const url = `${siteConfig.url}/blog/${post.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const extracted = extractToc(post.body)
  const toc = extracted?.toc ?? []
  const body = extracted?.data ?? post.body

  return (
    <div className="bg-surface min-h-screen">
      <Navigation />
      <BlogPost post={post} toc={toc} body={body} />
      <Footer />
    </div>
  )
}
