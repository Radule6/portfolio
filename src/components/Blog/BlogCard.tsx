import Image from "next/image"
import Link from "next/link"
import type { Post, Media } from "@/payload-types"
import { formatPostDate } from "@/lib/format-date"

type Props = {
  post: Post
}

export default function BlogCard({ post }: Props) {
  const cover = typeof post.coverImage === "object" ? (post.coverImage as Media) : null
  const tags = Array.isArray(post.tags) ? post.tags : []

  return (
    <article className="group relative h-full">
      <Link
        href={`/blog/${post.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-raised transition-colors duration-200 hover:border-border-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime"
        aria-label={`Read post: ${post.title}`}
      >
        <span
          className="absolute top-0 left-0 z-10 h-[2px] w-0 transition-[width] duration-700 ease-out group-hover:w-full"
          style={{ background: "linear-gradient(to right, #B7FF03, transparent)" }}
          aria-hidden="true"
        />

        {cover?.url && (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface">
            <Image
              src={cover.url}
              alt={cover.alt ?? post.title}
              fill
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col p-6 sm:p-7">
          {tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {tags.slice(0, 3).map((t) => (
                <span
                  key={t.id ?? t.label}
                  className="font-body text-xs tracking-wide px-3 py-1 rounded-full border border-border text-text-muted"
                >
                  {t.label}
                </span>
              ))}
            </div>
          )}

          <h2 className="font-display text-xl sm:text-2xl font-700 tracking-tight text-text-primary transition-colors duration-200 group-hover:text-accent-lime">
            {post.title}
          </h2>

          <p className="mt-3 font-body text-sm sm:text-base text-text-secondary leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>

          <div className="mt-6 flex items-center gap-2 font-body text-xs tracking-wide text-text-muted">
            <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
            {post.readingTime ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{post.readingTime} min read</span>
              </>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  )
}
