"use client"

import { useEffect, useRef } from "react"

export default function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }

    let raf: number | null = null
    const update = () => {
      raf = null
      const max = document.documentElement.scrollHeight - window.innerHeight
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${ratio})`
      }
    }

    const onScroll = () => {
      if (raf != null) return
      raf = requestAnimationFrame(update)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    update()

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (raf != null) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2px] z-[80] origin-left"
      style={{
        background: "linear-gradient(to right, #59FFCE, #B7FF03, #FFFF00)",
        transform: "scaleX(0)",
      }}
    />
  )
}
