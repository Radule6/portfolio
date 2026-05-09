import "@testing-library/jest-dom/vitest"
import * as React from "react"
import { vi } from "vitest"

vi.mock("next/image", () => ({
  default: ({ src, alt }: Record<string, unknown>) =>
    React.createElement("img", { src, alt }),
}))

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: Record<string, unknown> & { children?: React.ReactNode }) =>
    React.createElement("a", { href, ...rest }, children),
}))
