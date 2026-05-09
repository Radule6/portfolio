import { describe, it, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ScreenshotsGallery from "@/components/CaseStudy/ScreenshotsGallery"

const item = (label: string, caption?: string) => ({
  image: { url: `https://example.com/${label}.png`, alt: `${label} alt`, width: 800, height: 400 },
  caption,
})

describe("ScreenshotsGallery", () => {
  it("renders nothing when items is undefined", () => {
    const { container } = render(<ScreenshotsGallery items={undefined} projectTitle="X" />)
    expect(container.firstChild).toBeNull()
  })

  it("renders nothing when items is null", () => {
    const { container } = render(<ScreenshotsGallery items={null} projectTitle="X" />)
    expect(container.firstChild).toBeNull()
  })

  it("renders nothing when items is empty array", () => {
    const { container } = render(<ScreenshotsGallery items={[]} projectTitle="X" />)
    expect(container.firstChild).toBeNull()
  })

  it("renders one image per item", () => {
    render(
      <ScreenshotsGallery
        projectTitle="My Project"
        items={[item("a"), item("b"), item("c")]}
      />
    )
    expect(screen.getAllByRole("img")).toHaveLength(3)
  })

  it("renders captions when provided, omits when absent", () => {
    render(
      <ScreenshotsGallery
        projectTitle="My Project"
        items={[item("a", "Caption A"), item("b")]}
      />
    )
    expect(screen.getByText("Caption A")).toBeInTheDocument()
    expect(screen.queryByText("Caption B")).toBeNull()
  })

  it("opens lightbox on tile click", async () => {
    const user = userEvent.setup()
    render(<ScreenshotsGallery projectTitle="X" items={[item("a")]} />)
    expect(screen.queryByRole("dialog")).toBeNull()
    await user.click(screen.getByLabelText(/view full screenshot/i))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("closes lightbox on Esc", async () => {
    const user = userEvent.setup()
    render(<ScreenshotsGallery projectTitle="X" items={[item("a")]} />)
    await user.click(screen.getByLabelText(/view full screenshot/i))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    fireEvent.keyDown(window, { key: "Escape" })
    expect(screen.queryByRole("dialog")).toBeNull()
  })
})
