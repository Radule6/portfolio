import Link from "next/link"
import type { Post } from "@/payload-types"
import BlogCard from "./BlogCard"

type Props = {
  docs: Post[]
  page: number
  totalPages: number
}

function pageHref(n: number): string {
  return n <= 1 ? "/blog" : `/blog?page=${n}`
}

function buildPageList(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set<number>([1, total, current - 1, current, current + 1])
  return Array.from(pages)
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b)
}

export default function BlogList({ docs, page, totalPages }: Props) {
  const pageList = buildPageList(page, totalPages)
  const hasPrev = page > 1
  const hasNext = page < totalPages

  return (
    <section
      id="blog"
      className="relative bg-surface px-6 sm:px-10 lg:px-16 pt-32 sm:pt-36 lg:pt-40 pb-20 sm:pb-24 lg:pb-28"
      aria-label="Blog listing"
    >
      <div className="mb-12 sm:mb-16">
        <div className="flex items-center gap-4 mb-4">
          <span className="font-body text-xs sm:text-sm tracking-[0.3em] uppercase text-text-muted">
            04
          </span>
          <div className="h-px w-12 bg-border" aria-hidden="true" />
          <span className="font-body text-xs sm:text-sm tracking-[0.3em] uppercase text-text-secondary">
            Writing
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-800 tracking-tight text-text-primary">
          Blog
        </h1>
        <p className="mt-4 max-w-2xl font-body text-base sm:text-lg text-text-secondary leading-relaxed">
          Notes on AI engineering, full-stack development, and the tools I build with.
        </p>
      </div>

      {docs.length === 0 ? (
        <p className="font-body text-lg text-text-secondary">
          Nothing published yet — first post coming soon.
        </p>
      ) : (
        <ul role="list" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {docs.map((post) => (
            <li key={post.id}>
              <BlogCard post={post} />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-16 flex flex-wrap items-center justify-center gap-2">
          {hasPrev ? (
            <Link
              href={pageHref(page - 1)}
              className="font-body text-sm px-4 py-2 rounded-full border border-border text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors duration-200"
              rel="prev"
            >
              ← Previous
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="font-body text-sm px-4 py-2 rounded-full border border-border text-text-muted/50 cursor-not-allowed"
            >
              ← Previous
            </span>
          )}

          <ul className="flex items-center gap-1 mx-2" role="list">
            {pageList.map((n, i) => {
              const prev = pageList[i - 1]
              const showEllipsis = prev !== undefined && n - prev > 1
              return (
                <li key={n} className="flex items-center gap-1">
                  {showEllipsis && (
                    <span className="font-body text-sm text-text-muted px-1" aria-hidden="true">
                      …
                    </span>
                  )}
                  {n === page ? (
                    <span
                      aria-current="page"
                      className="font-body text-sm px-3 py-1 rounded-full border border-accent-lime text-accent-lime"
                    >
                      {n}
                    </span>
                  ) : (
                    <Link
                      href={pageHref(n)}
                      className="font-body text-sm px-3 py-1 rounded-full border border-transparent text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors duration-200"
                      aria-label={`Go to page ${n}`}
                    >
                      {n}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>

          {hasNext ? (
            <Link
              href={pageHref(page + 1)}
              className="font-body text-sm px-4 py-2 rounded-full border border-border text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors duration-200"
              rel="next"
            >
              Next →
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="font-body text-sm px-4 py-2 rounded-full border border-border text-text-muted/50 cursor-not-allowed"
            >
              Next →
            </span>
          )}
        </nav>
      )}
    </section>
  )
}
