import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { getPayload } from "payload"
import config from "@payload-config"
import { siteConfig } from "@/lib/site-config"
import RichText from "@/components/RichText/RichText"
import Navigation from "@/components/Navigation/Navigation"
import Footer from "@/components/Footer/Footer"
import { FiExternalLink, FiGithub, FiArrowLeft } from "react-icons/fi"

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
  const project = await getProject(slug)
  if (!project) return {}
  const hero = typeof project.heroImage === "object" ? project.heroImage : null
  const ogFromSeo =
    typeof project.seo?.ogImage === "object" ? project.seo.ogImage : null
  const ogImage = ogFromSeo?.url ?? hero?.url ?? siteConfig.ogImage
  const title = project.seo?.title ?? project.title
  const description = project.seo?.description ?? project.description
  return {
    title,
    description,
    alternates: { canonical: `${siteConfig.url}/projects/${project.slug}` },
    openGraph: {
      type: "article",
      url: `${siteConfig.url}/projects/${project.slug}`,
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export const dynamicParams = true

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project || !project.body) notFound()

  const hero = typeof project.heroImage === "object" ? project.heroImage : null
  const tags = Array.isArray(project.tags) ? project.tags.map((t) => t.label) : []

  return (
    <div className="bg-surface min-h-screen">
      <Navigation />
      <main className="px-6 sm:px-10 lg:px-16 py-20 sm:py-28 max-w-4xl mx-auto">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 font-body text-sm text-text-muted hover:text-text-primary transition-colors duration-200 mb-12"
        >
          <FiArrowLeft className="w-4 h-4" />
          All projects
        </Link>

        {project.company && (
          <span className="font-body text-xs tracking-[0.3em] uppercase text-text-muted">
            {project.role ? `${project.role} · ` : ""}{project.company}
          </span>
        )}

        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-800 tracking-tight text-text-primary mt-3 mb-6">
          {project.title}
        </h1>

        <p className="font-body text-lg text-text-secondary leading-relaxed mb-10 max-w-2xl">
          {project.description}
        </p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-12">
            {tags.map((tag) => (
              <span
                key={tag}
                className="font-body text-xs tracking-wide px-3 py-1 rounded-full border border-border text-text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {hero?.url && (
          <div className="rounded-2xl overflow-hidden border border-border mb-12">
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

        <div className="mt-16 pt-8 border-t border-border flex flex-wrap gap-3">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-sm border border-border rounded-full px-4 py-2 text-text-secondary hover:text-text-primary hover:border-border-hover transition-all duration-200"
            >
              <FiExternalLink className="w-4 h-4" />
              View live
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-sm border border-border rounded-full px-4 py-2 text-text-secondary hover:text-text-primary hover:border-border-hover transition-all duration-200"
            >
              <FiGithub className="w-4 h-4" />
              Source
            </a>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
