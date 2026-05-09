import { describe, it, expect } from "vitest"
import { formatProjectDate, formatPostDate } from "@/lib/format-date"

describe("formatProjectDate", () => {
  it("returns the 4-digit year for an ISO date", () => {
    expect(formatProjectDate("2024-06-15")).toBe("2024")
  })

  it("returns the 4-digit year for a Date object", () => {
    expect(formatProjectDate(new Date("2025-01-01T00:00:00Z"))).toBe("2025")
  })
})

describe("formatPostDate (existing, regression)", () => {
  it("returns 'MMM d, yyyy' format", () => {
    expect(formatPostDate("2024-06-15T00:00:00Z")).toMatch(/Jun 1[45], 2024/)
  })
})
