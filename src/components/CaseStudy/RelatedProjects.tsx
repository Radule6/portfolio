import Image from "next/image"
import Link from "next/link"

export type RelatedProjectsProps = {
  projects: Array<{
    slug: string
    title: string
    description: string
    heroImage?: { url: string; alt?: string | null; width?: number | null; height?: number | null } | null
    accentColor: string
  }> | null | undefined
}

export default function RelatedProjects({ projects }: RelatedProjectsProps) {
  if (!projects || projects.length === 0) return null
  return (
    <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
      {projects.map((p) => (
        <li key={p.slug}>
          <Link
            href={`/projects/${p.slug}`}
            className="group block rounded-xl border border-border bg-surface-raised overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime relative"
            style={{ ["--accent" as string]: p.accentColor }}
          >
            <span
              aria-hidden="true"
              className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-[0.06] blur-[60px] transition-opacity duration-500 pointer-events-none"
              style={{ background: "var(--accent)" }}
            />
            {p.heroImage?.url && (
              <Image
                src={p.heroImage.url}
                alt={p.heroImage.alt ?? `${p.title} hero`}
                width={p.heroImage.width ?? 1600}
                height={p.heroImage.height ?? 900}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="w-full h-auto"
              />
            )}
            <div className="p-5">
              <h3 className="font-display text-xl font-700 text-text-primary tracking-tight mb-1 group-hover:text-accent-lime transition-colors">
                {p.title}
              </h3>
              <p className="font-body text-sm text-text-secondary leading-relaxed line-clamp-2">
                {p.description}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
