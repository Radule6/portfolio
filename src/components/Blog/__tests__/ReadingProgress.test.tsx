import { describe, it, expect, beforeAll, vi } from "vitest"
import { render } from "@testing-library/react"
import ReadingProgress from "@/components/Blog/ReadingProgress"

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

describe("ReadingProgress", () => {
  it("uses the default tri-gradient when color is not provided", () => {
    const { container } = render(<ReadingProgress />)
    const bar = container.firstElementChild as HTMLElement
    expect(bar.style.background).toMatch(/linear-gradient/)
  })

  it("uses the provided color when color is set", () => {
    const { container } = render(<ReadingProgress color="#FF00FF" />)
    const bar = container.firstElementChild as HTMLElement
    expect(bar.style.background).toBe("rgb(255, 0, 255)")
  })
})
