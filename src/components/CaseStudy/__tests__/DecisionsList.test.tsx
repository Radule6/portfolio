import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import DecisionsList from "@/components/CaseStudy/DecisionsList"

const rationale = (text: string) => ({
  root: {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [{ type: "text", text, version: 1 }],
        direction: null, format: "", indent: 0, version: 1,
      },
    ],
    direction: null, format: "", indent: 0, version: 1,
  },
}) as never

describe("DecisionsList", () => {
  it("renders nothing when decisions is undefined", () => {
    const { container } = render(<DecisionsList decisions={undefined} accentColor="#59FFCE" />)
    expect(container.firstChild).toBeNull()
  })

  it("renders nothing when decisions is null", () => {
    const { container } = render(<DecisionsList decisions={null} accentColor="#59FFCE" />)
    expect(container.firstChild).toBeNull()
  })

  it("renders nothing when decisions is empty array", () => {
    const { container } = render(<DecisionsList decisions={[]} accentColor="#59FFCE" />)
    expect(container.firstChild).toBeNull()
  })

  it("renders title + rationale per decision", () => {
    render(
      <DecisionsList
        accentColor="#59FFCE"
        decisions={[
          { title: "Why Next.js?", rationale: rationale("App Router fits our needs.") },
          { title: "Why Payload?", rationale: rationale("In-app admin.") },
        ]}
      />
    )
    expect(screen.getByText("Why Next.js?")).toBeInTheDocument()
    expect(screen.getByText("App Router fits our needs.")).toBeInTheDocument()
    expect(screen.getByText("Why Payload?")).toBeInTheDocument()
    expect(screen.getByText("In-app admin.")).toBeInTheDocument()
  })

  it("exposes accentColor as --accent on outermost element", () => {
    const { container } = render(
      <DecisionsList
        accentColor="#FF00FF"
        decisions={[{ title: "X", rationale: rationale("Y") }]}
      />
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.style.getPropertyValue("--accent")).toBe("#FF00FF")
  })
})
