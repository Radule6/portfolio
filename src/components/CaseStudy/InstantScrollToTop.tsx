"use client"

import { useLayoutEffect } from "react"

/**
 * Snaps the viewport to the top on mount, bypassing the global
 * `scroll-behavior: smooth` that would otherwise animate cross-page
 * navigation. In-page anchor scrolls (TOC, hash links) still inherit
 * the smooth behavior because they don't pass a `behavior` argument.
 */
export default function InstantScrollToTop() {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior })
  }, [])
  return null
}
