import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { getPayload } from "payload"
import config from "@payload-config"

import { siteConfig } from "@/lib/site-config"
import { hasContent } from "@/lib/lexical-utils"
import { filterStaticParamsCandidates } from "@/lib/case-study-data"
import RichText from "@/components/RichText/RichText"
import Navigation from "@/components/Navigation/Navigation"
import Footer from "@/components/Footer/Footer"
import ReadingProgress from "@/components/Blog/ReadingProgress"
import TableOfContents from "@/components/Blog/TableOfContents"
import type { TocEntry } from "@/lib/blog-toc"

import ProjectHero from "@/components/CaseStudy/ProjectHero"
import TechStackBadges from "@/components/CaseStudy/TechStackBadges"
import DecisionsList from "@/components/CaseStudy/DecisionsList"
import ScreenshotsGallery from "@/components/CaseStudy/ScreenshotsGallery"
import ResultsList from "@/components/CaseStudy/ResultsList"
import RelatedProjects from "@/components/CaseStudy/RelatedProjects"
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
  return filterStaticParamsCandidates(docs)
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
  if (!project) notFound()
  if (!hasContent(project.problem) && !hasContent(project.approach)) notFound()

  const heroDoc = typeof project.heroImage === "object" ? project.heroImage : null
  const hero = heroDoc?.url
    ? { url: heroDoc.url, alt: heroDoc.alt, width: heroDoc.width, height: heroDoc.height }
    : null
  const diagramDoc = typeof project.diagram === "object" ? project.diagram : null
  const diagram = diagramDoc?.url
    ? { url: diagramDoc.url, alt: diagramDoc.alt, width: diagramDoc.width, height: diagramDoc.height }
    : null

  const showProblem = hasContent(project.problem)
  const showApproach = hasContent(project.approach) || Boolean(diagram?.url)
  const showDecisions = (project.decisions?.length ?? 0) > 0
  const showScreenshots = (project.gallery?.length ?? 0) > 0
  const showResults = (project.results?.length ?? 0) > 0
  const showLinks = Boolean(project.liveUrl) || Boolean(project.repoUrl)

  const related = (project.relatedProjects ?? [])
    .filter(
      (p): p is Extract<typeof p, { slug: string }> => typeof p === "object" && p !== null,
    )
    .map((p) => {
      const rh = typeof p.heroImage === "object" ? p.heroImage : null
      const heroImage = rh?.url
        ? { url: rh.url, alt: rh.alt, width: rh.width, height: rh.height }
        : null
      return {
        slug: p.slug,
        title: p.title,
        description: p.description,
        heroImage,
        accentColor: p.accentColor ?? "#59FFCE",
      }
    })
  const showRelated = related.length > 0

  const toc: TocEntry[] = []
  if (showProblem) toc.push({ id: "problem", text: "Problem", level: 2 })
  if (showApproach) toc.push({ id: "approach", text: "Approach", level: 2 })
  if (showDecisions) toc.push({ id: "decisions", text: "Key decisions", level: 2 })
  if (showScreenshots) toc.push({ id: "screenshots", text: "Screenshots", level: 2 })
  if (showResults) toc.push({ id: "results", text: "Results", level: 2 })
  if (showRelated) toc.push({ id: "related", text: "Related projects", level: 2 })

  const galleryItems = (project.gallery ?? [])
    .map((g) => {
      const m = typeof g.image === "object" ? g.image : null
      if (!m?.url) return null
      return {
        image: { url: m.url, alt: m.alt, width: m.width, height: m.height },
        caption: g.caption,
      }
    })
    .filter((it): it is NonNullable<typeof it> => it !== null)

  return (
    <div className="bg-surface min-h-screen">
      <Navigation />
      <ReadingProgress color={project.accentColor} />
      <main className="px-6 sm:px-10 lg:px-16 py-20 sm:py-28 max-w-7xl mx-auto">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 font-body text-sm text-text-muted hover:text-text-primary transition-colors duration-200 mb-12"
        >
          <FiArrowLeft className="w-4 h-4" />
          All projects
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[14rem_1fr] gap-10 lg:gap-16">
          <aside className="hidden lg:block">
            <TableOfContents toc={toc} />
          </aside>

          <article className="min-w-0">
            <ProjectHero
              title={project.title}
              description={project.description}
              company={project.company}
              role={project.role}
              dateBuilt={project.dateBuilt}
              lifecycle={project.lifecycle}
              accentColor={project.accentColor}
              heroImage={hero}
            />
            <TechStackBadges tags={project.tags} />

            {showProblem && (
              <section id="problem" className="scroll-mt-28 my-12">
                <h2 className="font-display text-2xl sm:text-3xl font-700 text-text-primary tracking-tight mb-4">
                  Problem
                </h2>
                <RichText data={project.problem} />
              </section>
            )}

            {showApproach && (
              <section id="approach" className="scroll-mt-28 my-12">
                <h2 className="font-display text-2xl sm:text-3xl font-700 text-text-primary tracking-tight mb-4">
                  Approach
                </h2>
                {diagram?.url && (
                  <div className="rounded-2xl overflow-hidden border border-border mb-6">
                    <Image
                      src={diagram.url}
                      alt={diagram.alt ?? `${project.title} architecture diagram`}
                      width={diagram.width ?? 1600}
                      height={diagram.height ?? 900}
                      sizes="(min-width: 1024px) 700px, 100vw"
                      className="w-full h-auto"
                    />
                  </div>
                )}
                <RichText data={project.approach} />
              </section>
            )}

            {showDecisions && (
              <section id="decisions" className="scroll-mt-28 my-12">
                <h2 className="font-display text-2xl sm:text-3xl font-700 text-text-primary tracking-tight mb-4">
                  Key decisions
                </h2>
                <DecisionsList
                  decisions={
                    project.decisions?.map((d) => ({
                      title: d.title,
                      rationale: d.rationale,
                    })) ?? null
                  }
                  accentColor={project.accentColor}
                />
              </section>
            )}

            {showScreenshots && galleryItems.length > 0 && (
              <section id="screenshots" className="scroll-mt-28 my-12">
                <h2 className="font-display text-2xl sm:text-3xl font-700 text-text-primary tracking-tight mb-4">
                  Screenshots
                </h2>
                <ScreenshotsGallery items={galleryItems} projectTitle={project.title} />
              </section>
            )}

            {showResults && (
              <section id="results" className="scroll-mt-28 my-12">
                <h2 className="font-display text-2xl sm:text-3xl font-700 text-text-primary tracking-tight mb-4">
                  Results
                </h2>
                <ResultsList results={project.results} accentColor={project.accentColor} />
              </section>
            )}

            {showLinks && (
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
            )}

            {showRelated && (
              <section id="related" className="scroll-mt-28 my-16">
                <h2 className="font-display text-2xl sm:text-3xl font-700 text-text-primary tracking-tight mb-4">
                  Related projects
                </h2>
                <RelatedProjects projects={related} />
              </section>
            )}
          </article>
        </div>
      </main>
      <Footer />
    </div>
  )
}
