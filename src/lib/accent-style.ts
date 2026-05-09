import type { CSSProperties } from "react"

export function accentStyle(color: string): CSSProperties {
  return { "--accent": color } as CSSProperties
}
