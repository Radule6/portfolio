import type { CollectionBeforeChangeHook } from "payload"

export const autoSlug =
  (sourceField = "title"): CollectionBeforeChangeHook =>
  ({ data, operation, originalDoc }) => {
    if (data.slug && typeof data.slug === "string" && data.slug.trim().length > 0) return data
    const source = (data as Record<string, unknown>)[sourceField] ?? originalDoc?.[sourceField]
    if (typeof source !== "string" || source.length === 0) return data
    if (operation === "create" || operation === "update") {
      data.slug = source
        .toLowerCase()
        .trim()
        .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80)
    }
    return data
  }
