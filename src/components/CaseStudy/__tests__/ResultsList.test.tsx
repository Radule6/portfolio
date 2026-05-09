import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import ResultsList from "@/components/CaseStudy/ResultsList"

describe("ResultsList", () => {
  it("renders nothing when results is undefined", () => {
    const { container } = render(<ResultsList results={undefined} accentColor="#59FFCE" />)
    expect(container.firstChild).toBeNull()
  })

  it("renders nothing when results is null", () => {
    const { container } = render(<ResultsList results={null} accentColor="#59FFCE" />)
    expect(container.firstChild).toBeNull()
  })

  it("renders nothing when results is empty array", () => {
    const { container } = render(<ResultsList results={[]} accentColor="#59FFCE" />)
    expect(container.firstChild).toBeNull()
  })

  it("renders one card per result with label and value", () => {
    render(
      <ResultsList
        accentColor="#59FFCE"
        results={[
          { label: "Latency", value: "150ms p99" },
          { label: "Cost", value: "-40%" },
        ]}
      />
    )
    expect(screen.getByText("Latency")).toBeInTheDocument()
    expect(screen.getByText("150ms p99")).toBeInTheDocument()
    expect(screen.getByText("Cost")).toBeInTheDocument()
    expect(screen.getByText("-40%")).toBeInTheDocument()
  })

  it("exposes accentColor as --accent on outermost element", () => {
    const { container } = render(
      <ResultsList accentColor="#B7FF03" results={[{ label: "L", value: "V" }]} />
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.style.getPropertyValue("--accent")).toBe("#B7FF03")
  })
})
