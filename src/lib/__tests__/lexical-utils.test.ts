import { describe, it, expect } from "vitest"
import { hasContent } from "@/lib/lexical-utils"

describe("hasContent", () => {
  it("returns false for null", () => {
    expect(hasContent(null)).toBe(false)
  })

  it("returns false for undefined", () => {
    expect(hasContent(undefined)).toBe(false)
  })

  it("returns false for empty Lexical doc (single empty paragraph)", () => {
    const doc = {
      root: {
        type: "root",
        children: [{ type: "paragraph", children: [], direction: null, format: "", indent: 0, version: 1 }],
        direction: null,
        format: "",
        indent: 0,
        version: 1,
      },
    } as never
    expect(hasContent(doc)).toBe(false)
  })

  it("returns false for a doc whose only child has only empty text nodes", () => {
    const doc = {
      root: {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [{ type: "text", text: "", version: 1 }],
            direction: null, format: "", indent: 0, version: 1,
          },
        ],
        direction: null, format: "", indent: 0, version: 1,
      },
    } as never
    expect(hasContent(doc)).toBe(false)
  })

  it("returns true for a doc with text", () => {
    const doc = {
      root: {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [{ type: "text", text: "Hello", version: 1 }],
            direction: null, format: "", indent: 0, version: 1,
          },
        ],
        direction: null, format: "", indent: 0, version: 1,
      },
    } as never
    expect(hasContent(doc)).toBe(true)
  })

  it("returns true for a doc with a heading", () => {
    const doc = {
      root: {
        type: "root",
        children: [
          {
            type: "heading", tag: "h2",
            children: [{ type: "text", text: "Title", version: 1 }],
            direction: null, format: "", indent: 0, version: 1,
          },
        ],
        direction: null, format: "", indent: 0, version: 1,
      },
    } as never
    expect(hasContent(doc)).toBe(true)
  })
})
