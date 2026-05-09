export function formatPostDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatProjectDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso
  return String(d.getUTCFullYear())
}
