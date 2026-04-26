import type { Post } from "@/payload-types"

export type TocEntry = {
  id: string
  text: string
  level: 2 | 3
}

export type ExtractedToc = {
  toc: TocEntry[]
  data: Post["body"]
}

type LexicalNode = { type?: string; [k: string]: unknown }

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "section"
}

function nodeText(node: LexicalNode): string {
  const children = (node.children as LexicalNode[] | undefined) ?? []
  let out = ""
  for (const child of children) {
    if (child.type === "text" && typeof child.text === "string") {
      out += child.text
    } else if (Array.isArray(child.children)) {
      out += nodeText(child)
    }
  }
  return out
}

/**
 * Walks the top-level Lexical body children, identifies h2/h3 heading nodes,
 * assigns each a stable, collision-free slug id (mutating a deep clone), and
 * returns the augmented body alongside a TOC list. RichText reads `node.id`
 * during render so headings emit `<h2 id="...">` for in-page anchoring.
 */
export function extractToc(data: Post["body"] | null | undefined): ExtractedToc | null {
  if (!data) return null
  const cloned = structuredClone(data)
  const toc: TocEntry[] = []
  const counts = new Map<string, number>()

  const children = (cloned?.root?.children ?? []) as LexicalNode[]
  for (const node of children) {
    if (node.type !== "heading") continue
    const tag = node.tag
    if (tag !== "h2" && tag !== "h3") continue

    const text = nodeText(node).trim()
    if (!text) continue

    const base = slugify(text)
    const count = counts.get(base) ?? 0
    counts.set(base, count + 1)
    const id = count === 0 ? base : `${base}-${count + 1}`

    ;(node as { id?: string }).id = id
    toc.push({ id, text, level: tag === "h2" ? 2 : 3 })
  }

  return { toc, data: cloned }
}
