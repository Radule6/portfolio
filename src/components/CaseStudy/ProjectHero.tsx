import Image from "next/image"
import { accentStyle } from "@/lib/accent-style"
import { formatProjectDate } from "@/lib/format-date"

export type ProjectHeroProps = {
  title: string
  description: string
  company?: string | null
  role?: string | null
  dateBuilt?: string | null
  lifecycle: "live" | "archived"
  accentColor: string
  heroImage?: { url: string; alt?: string | null; width?: number | null; height?: number | null } | null
}

export default function ProjectHero({
  title,
  description,
  company,
  role,
  dateBuilt,
  lifecycle,
  accentColor,
  heroImage,
}: ProjectHeroProps) {
  const eyebrow = role && company ? `${role} · ${company}` : (role ?? company ?? null)
  const lifecycleLabel = lifecycle === "live" ? "Live" : "Archived"

  return (
    <header style={accentStyle(accentColor)} className="mb-12">
      {eyebrow && (
        <span
          data-testid="hero-eyebrow"
          className="font-body text-xs tracking-[0.3em] uppercase text-text-muted"
        >
          {eyebrow}
        </span>
      )}

      <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-800 tracking-tight text-text-primary mt-3 mb-6">
        {title}
      </h1>

      <p className="font-body text-lg text-text-secondary leading-relaxed mb-6 max-w-2xl">
        {description}
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-10">
        {dateBuilt && (
          <span
            data-testid="hero-date"
            className="font-body text-sm text-text-muted tabular-nums"
          >
            {formatProjectDate(dateBuilt)}
          </span>
        )}
        <span
          data-testid="hero-lifecycle"
          className={`font-body text-[10px] tracking-[0.2em] uppercase whitespace-nowrap px-3 py-1 rounded-full border ${
            lifecycle === "archived"
              ? "border-border bg-surface-hover text-text-muted"
              : "border-border bg-surface-hover text-text-secondary"
          }`}
          style={lifecycle === "live" ? { color: "var(--accent)" } : undefined}
        >
          {lifecycleLabel}
        </span>
      </div>

      <div
        aria-hidden="true"
        className="h-[2px] w-24 mb-12"
        style={{ background: "var(--accent)" }}
      />

      {heroImage?.url && (
        <div className="rounded-2xl overflow-hidden border border-border mb-12">
          <Image
            src={heroImage.url}
            alt={heroImage.alt ?? `${title} hero image`}
            width={heroImage.width ?? 1905}
            height={heroImage.height ?? 937}
            sizes="(min-width: 1024px) 896px, 100vw"
            className="w-full h-auto"
            priority
          />
        </div>
      )}
    </header>
  )
}
