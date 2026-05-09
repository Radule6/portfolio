import { describe, it, expect, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import ProjectHero from "@/components/CaseStudy/ProjectHero"

afterEach(cleanup)

const minimal = {
  title: "Test Project",
  description: "A short tagline.",
  lifecycle: "live" as const,
  accentColor: "#59FFCE",
}

describe("ProjectHero", () => {
  it("renders title even with no optional props", () => {
    render(<ProjectHero {...minimal} />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Test Project")
  })

  it("renders description as tagline", () => {
    render(<ProjectHero {...minimal} />)
    expect(screen.getByText("A short tagline.")).toBeInTheDocument()
  })

  it("hides eyebrow when company and role both absent", () => {
    const { container } = render(<ProjectHero {...minimal} />)
    expect(container.querySelector("[data-testid=\"hero-eyebrow\"]")).toBeNull()
  })

  it("renders eyebrow with role · company when both present", () => {
    render(<ProjectHero {...minimal} company="Acme" role="Engineer" />)
    const eyebrow = screen.getByTestId("hero-eyebrow")
    expect(eyebrow).toHaveTextContent("Engineer · Acme")
  })

  it("renders eyebrow with company only when role absent", () => {
    render(<ProjectHero {...minimal} company="Acme" />)
    expect(screen.getByTestId("hero-eyebrow")).toHaveTextContent("Acme")
  })

  it("hides hero image when heroImage is undefined", () => {
    const { container } = render(<ProjectHero {...minimal} />)
    expect(container.querySelector("img")).toBeNull()
  })

  it("renders hero image when heroImage.url is present", () => {
    render(
      <ProjectHero
        {...minimal}
        heroImage={{ url: "https://example.com/x.png", alt: "Alt", width: 100, height: 50 }}
      />
    )
    expect(screen.getByAltText("Alt")).toBeInTheDocument()
  })

  it("renders dateBuilt as 4-digit year", () => {
    render(<ProjectHero {...minimal} dateBuilt="2024-06-15" />)
    expect(screen.getByTestId("hero-date")).toHaveTextContent("2024")
  })

  it("hides date when dateBuilt absent", () => {
    render(<ProjectHero {...minimal} />)
    expect(screen.queryByTestId("hero-date")).toBeNull()
  })

  it("lifecycle badge text is 'Live' when lifecycle is 'live'", () => {
    render(<ProjectHero {...minimal} />)
    expect(screen.getByTestId("hero-lifecycle")).toHaveTextContent(/^Live$/)
  })

  it("lifecycle badge text is 'Archived' when lifecycle is 'archived'", () => {
    render(<ProjectHero {...minimal} lifecycle="archived" />)
    expect(screen.getByTestId("hero-lifecycle")).toHaveTextContent(/^Archived$/)
  })

  it("exposes accentColor as --accent on the outermost element", () => {
    const { container } = render(<ProjectHero {...minimal} />)
    const root = container.firstElementChild as HTMLElement
    expect(root.style.getPropertyValue("--accent")).toBe("#59FFCE")
  })
})
