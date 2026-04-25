import { getPayload } from "payload"
import config from "@payload-config"
import Projects, { type Project } from "./Projects"

export default async function ProjectsServer() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: "projects",
    where: { status: { not_equals: "draft" } },
    sort: "order",
    depth: 1,
    limit: 50,
  })

  const projects: Project[] = docs.map((doc) => {
    const hero = typeof doc.heroImage === "object" && doc.heroImage !== null ? doc.heroImage : null
    const tags = Array.isArray(doc.tags) ? doc.tags.map((t) => t.label).filter(Boolean) : []

    return {
      title: doc.title,
      slug: doc.slug,
      description: doc.description,
      tags,
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
