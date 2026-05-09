import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical"

type LexicalNode = { type?: string; text?: string; children?: LexicalNode[] }

const CONTENT_LEAF_TYPES = new Set(["horizontalrule", "image", "upload", "block"])

function nodeHasContent(node: LexicalNode): boolean {
  if (node.type === "text" && typeof node.text === "string" && node.text.length > 0) return true
  if (CONTENT_LEAF_TYPES.has(node.type ?? "")) return true
  for (const child of node.children ?? []) {
    if (nodeHasContent(child)) return true
  }
  return false
}

export function hasContent(data: SerializedEditorState | null | undefined): boolean {
  if (!data) return false
  const children = (data.root?.children ?? []) as LexicalNode[]
  for (const child of children) {
    if (nodeHasContent(child)) return true
  }
  return false
}
