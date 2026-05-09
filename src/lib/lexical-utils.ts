import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical"

type LexicalNode = { type?: string; text?: string; children?: LexicalNode[] }

function nodeHasText(node: LexicalNode): boolean {
  if (node.type === "text" && typeof node.text === "string" && node.text.length > 0) return true
  const children = node.children ?? []
  for (const child of children) {
    if (nodeHasText(child)) return true
  }
  // A heading or list with no text but with structural children of non-text type
  // (e.g., embedded image) still counts as content.
  if (node.type !== "text" && node.type !== "paragraph" && children.length === 0) {
    // Empty non-text leaf (e.g., a horizontal rule) — counts as content.
    return ["horizontalrule", "image", "upload", "block"].includes(node.type ?? "")
  }
  return false
}

export function hasContent(data: SerializedEditorState | null | undefined): boolean {
  if (!data) return false
  const root = (data as { root?: LexicalNode }).root
  if (!root) return false
  const children = root.children ?? []
  if (children.length === 0) return false
  for (const child of children) {
    if (nodeHasText(child)) return true
  }
  return false
}
