import { describe, it, expect } from "vitest"
import { filterStaticParamsCandidates, type StaticParamCandidate } from "@/lib/case-study-data"

const fullDoc = {
  root: {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [{ type: "text", text: "x", version: 1 }],
        direction: null,
        format: "",
        indent: 0,
        version: 1,
      },
    ],
    direction: null,
    format: "",
    indent: 0,
    version: 1,
  },
} as never

const emptyDoc = {
  root: {
    type: "root",
    children: [{ type: "paragraph", children: [], direction: null, format: "", indent: 0, version: 1 }],
    direction: null,
    format: "",
    indent: 0,
    version: 1,
  },
} as never

describe("filterStaticParamsCandidates", () => {
  it("excludes docs with no problem and no approach", () => {
    const docs: StaticParamCandidate[] = [
      { slug: "a", problem: null, approach: null },
      { slug: "b", problem: fullDoc, approach: null },
      { slug: "c", problem: null, approach: fullDoc },
    ]
    expect(filterStaticParamsCandidates(docs)).toEqual([{ slug: "b" }, { slug: "c" }])
  })

  it("includes a doc with problem only", () => {
    const docs: StaticParamCandidate[] = [{ slug: "x", problem: fullDoc, approach: null }]
    expect(filterStaticParamsCandidates(docs)).toEqual([{ slug: "x" }])
  })

  it("includes a doc with approach only", () => {
    const docs: StaticParamCandidate[] = [{ slug: "y", problem: null, approach: fullDoc }]
    expect(filterStaticParamsCandidates(docs)).toEqual([{ slug: "y" }])
  })

  it("excludes a doc with empty Lexical docs in both fields", () => {
    const docs: StaticParamCandidate[] = [{ slug: "z", problem: emptyDoc, approach: emptyDoc }]
    expect(filterStaticParamsCandidates(docs)).toEqual([])
  })
})
