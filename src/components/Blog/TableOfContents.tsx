"use client"

import { useEffect, useRef, useState } from "react"
import type { TocEntry } from "@/lib/blog-toc"

type Props = {
  toc: TocEntry[]
}

export default function TableOfContents({ toc }: Props) {
  const [activeId, setActiveId] = useState<string | null>(toc[0]?.id ?? null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (toc.length === 0) return
    const headings = toc
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => el !== null)
    if (headings.length === 0) return

    let lastIntersecting: string | null = null
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            lastIntersecting = entry.target.id
          }
        }
        if (lastIntersecting) setActiveId(lastIntersecting)
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 }
    )

    for (const el of headings) observer.observe(el)
    return () => observer.disconnect()
  }, [toc])

  if (toc.length === 0) return null

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
    history.replaceState({}, "", `#${id}`)
    setActiveId(id)
  }

  return (
    <nav
      ref={navRef}
      aria-label="Table of contents"
      className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-auto pr-2"
    >
      <p className="font-body text-xs tracking-[0.3em] uppercase text-text-muted mb-4">
        On this page
      </p>
      <ol role="list" className="border-l border-border space-y-0.5">
        {toc.map((entry) => {
          const isActive = entry.id === activeId
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                onClick={(e) => onClick(e, entry.id)}
                aria-current={isActive ? "true" : undefined}
                className={`block font-body text-sm leading-snug -ml-px py-1.5 border-l-2 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime ${
                  entry.level === 3 ? "pl-8" : "pl-4"
                } ${
                  isActive
                    ? "border-accent-lime text-text-primary"
                    : "border-transparent text-text-muted hover:text-text-primary"
                }`}
              >
                {entry.text}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
