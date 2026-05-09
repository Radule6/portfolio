import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import RelatedProjects from "@/components/CaseStudy/RelatedProjects"

const make = (slug: string, title: string) => ({
  slug,
  title,
  description: `${title} description.`,
  heroImage: { url: `https://example.com/${slug}.png`, alt: `${title} hero`, width: 1600, height: 900 },
  accentColor: "#59FFCE",
})

describe("RelatedProjects", () => {
  it("renders nothing when projects is undefined", () => {
    const { container } = render(<RelatedProjects projects={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it("renders nothing when projects is null", () => {
    const { container } = render(<RelatedProjects projects={null} />)
    expect(container.firstChild).toBeNull()
  })

  it("renders nothing when projects is empty array", () => {
    const { container } = render(<RelatedProjects projects={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it("links to /projects/<slug> for each card", () => {
    render(
      <RelatedProjects
        projects={[make("alpha", "Alpha"), make("beta", "Beta"), make("gamma", "Gamma")]}
      />
    )
    const links = screen.getAllByRole("link")
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "/projects/alpha",
      "/projects/beta",
      "/projects/gamma",
    ])
  })

  it("renders title and hero image per card", () => {
    render(<RelatedProjects projects={[make("a", "Alpha")]} />)
    expect(screen.getByText("Alpha")).toBeInTheDocument()
    expect(screen.getByAltText("Alpha hero")).toBeInTheDocument()
  })

  it("hides hero image gracefully when absent", () => {
    render(
      <RelatedProjects
        projects={[{ slug: "x", title: "X", description: "x", heroImage: null, accentColor: "#000" }]}
      />
    )
    expect(screen.queryByRole("img")).toBeNull()
    expect(screen.getByText("X")).toBeInTheDocument()
  })
})
