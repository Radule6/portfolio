import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import TechStackBadges from "@/components/CaseStudy/TechStackBadges"

describe("TechStackBadges", () => {
  it("renders nothing when tags is undefined", () => {
    const { container } = render(<TechStackBadges tags={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it("renders nothing when tags is null", () => {
    const { container } = render(<TechStackBadges tags={null} />)
    expect(container.firstChild).toBeNull()
  })

  it("renders nothing when tags is empty array", () => {
    const { container } = render(<TechStackBadges tags={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it("renders one pill per tag, in order", () => {
    render(<TechStackBadges tags={[{ label: "React" }, { label: "TypeScript" }, { label: "Tailwind" }]} />)
    const pills = screen.getAllByRole("listitem")
    expect(pills.map((p) => p.textContent)).toEqual(["React", "TypeScript", "Tailwind"])
  })
})
