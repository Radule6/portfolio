"use client"

import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import { FiX } from "react-icons/fi"

export type ScreenshotsGalleryItem = {
  image: { url: string; alt?: string | null; width?: number | null; height?: number | null }
  caption?: string | null
}

export type ScreenshotsGalleryProps = {
  items: ScreenshotsGalleryItem[] | null | undefined
  projectTitle: string
}

export default function ScreenshotsGallery({ items, projectTitle }: ScreenshotsGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  const close = useCallback(() => setActiveIndex(null), [])

  useEffect(() => {
    if (activeIndex === null) return
    returnFocusRef.current = document.activeElement as HTMLElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const focusFrame = requestAnimationFrame(() => closeRef.current?.focus())

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      ) ?? []
    )

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close()
        return
      }
      if (e.key === "Tab" && focusable.length > 0) {
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => {
      cancelAnimationFrame(focusFrame)
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKey)
      returnFocusRef.current?.focus()
    }
  }, [activeIndex, close])

  if (!items || items.length === 0) return null
  const active = activeIndex !== null ? items[activeIndex] : null

  return (
    <>
      <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-12">
        {items.map((it, idx) => (
          <li key={idx}>
            <button
              type="button"
              onClick={() => setActiveIndex(idx)}
              className="block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime rounded-xl overflow-hidden border border-border"
              aria-label={`View full screenshot ${idx + 1} of ${projectTitle}`}
            >
              <Image
                src={it.image.url}
                alt={it.image.alt ?? `${projectTitle} screenshot ${idx + 1}`}
                width={it.image.width ?? 1600}
                height={it.image.height ?? 900}
                sizes="(min-width: 1024px) 432px, 100vw"
                className="w-full h-auto"
              />
            </button>
            {it.caption && (
              <p className="font-body text-xs text-text-muted mt-2 leading-relaxed">{it.caption}</p>
            )}
          </li>
        ))}
      </ul>

      {active && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Screenshot of ${projectTitle}`}
        >
          <div
            className="absolute inset-0 bg-surface/90 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />
          <div ref={dialogRef} className="relative z-10 w-full max-w-5xl">
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              className="absolute -top-12 right-0 p-2 text-text-muted hover:text-text-primary transition-colors duration-200"
              aria-label="Close screenshot"
            >
              <FiX className="w-6 h-6" />
            </button>
            <div className="rounded-xl overflow-hidden border border-border">
              <Image
                src={active.image.url}
                alt={active.image.alt ?? `${projectTitle} full screenshot`}
                width={active.image.width ?? 1905}
                height={active.image.height ?? 937}
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="w-full h-auto block"
                priority
              />
            </div>
            {active.caption && (
              <p className="font-body text-sm text-text-secondary mt-4">{active.caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
