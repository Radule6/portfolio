import Image from "next/image"
import Link from "next/link"
import { FiArrowLeft } from "react-icons/fi"
import type { Post, Media } from "@/payload-types"
import type { TocEntry } from "@/lib/blog-toc"
import RichText from "@/components/RichText/RichText"
import { formatPostDate } from "@/lib/format-date"
import TableOfContents from "./TableOfContents"
import ReadingProgress from "./ReadingProgress"

type Props = {
  post: Post
  toc: TocEntry[]
  body: Post["body"]
}

export default function BlogPost({ post, toc, body }: Props) {
  const cover = typeof post.coverImage === "object" ? (post.coverImage as Media) : null
  const tags = Array.isArray(post.tags) ? post.tags : []

  return (
    <>
      <ReadingProgress />
      <main className="px-6 sm:px-10 lg:px-16 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-body text-sm text-text-muted hover:text-text-primary transition-colors duration-200 mb-12 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime rounded"
          >
            <FiArrowLeft className="w-4 h-4" aria-hidden="true" />
            All posts
          </Link>

          <header className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-xs tracking-[0.3em] uppercase text-text-muted">
              <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
              {post.readingTime ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{post.readingTime} min read</span>
                </>
              ) : null}
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-800 tracking-tight text-text-primary mt-4 mb-6">
              {post.title}
            </h1>

            <p className="font-body text-lg text-text-secondary leading-relaxed max-w-2xl">
              {post.excerpt}
            </p>

            {tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t.id ?? t.label}
                    className="font-body text-xs tracking-wide px-3 py-1 rounded-full border border-border text-text-muted"
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            )}
          </header>

          {cover?.url && (
            <div className="mt-12 rounded-2xl overflow-hidden border border-border">
              <Image
                src={cover.url}
                alt={cover.alt ?? post.title}
                width={cover.width ?? 1600}
                height={cover.height ?? 900}
                sizes="(min-width: 1280px) 1024px, 100vw"
                className="w-full h-auto"
                priority
              />
            </div>
          )}

          <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_220px]">
            <article className="min-w-0 max-w-[68ch]">
              <RichText data={body} />
            </article>
            {toc.length > 0 && (
              <aside className="hidden lg:block">
                <TableOfContents toc={toc} />
              </aside>
            )}
          </div>

          <div className="mt-20 pt-8 border-t border-border">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 font-body text-sm text-text-muted hover:text-text-primary transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime rounded"
            >
              <FiArrowLeft className="w-4 h-4" aria-hidden="true" />
              All posts
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
