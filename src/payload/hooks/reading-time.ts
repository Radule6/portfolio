import type { CollectionBeforeChangeHook } from "payload"

const WORDS_PER_MINUTE = 220

function countWords(node: unknown): number {
  if (!node) return 0
  if (typeof node === "string") return node.trim().split(/\s+/).filter(Boolean).length
  if (Array.isArray(node)) return node.reduce<number>((sum, n) => sum + countWords(n), 0)
  if (typeof node === "object") {
    const obj = node as Record<string, unknown>
    if (typeof obj.text === "string") return countWords(obj.text)
    if (Array.isArray(obj.children)) return countWords(obj.children)
    if (obj.root) return countWords(obj.root)
  }
  return 0
}

export const computeReadingTime: CollectionBeforeChangeHook = ({ data }) => {
  const words = countWords(data.body)
  data.readingTime = Math.max(1, Math.round(words / WORDS_PER_MINUTE))
  return data
}
