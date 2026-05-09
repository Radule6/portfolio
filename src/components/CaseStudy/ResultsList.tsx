export type ResultsListProps = {
  results: { label: string; value: string }[] | null | undefined
  accentColor: string
}

export default function ResultsList({ results, accentColor }: ResultsListProps) {
  if (!results || results.length === 0) return null
  return (
    <dl
      style={{ ["--accent" as string]: accentColor }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-12"
    >
      {results.map((r, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-surface-raised p-6"
        >
          <dt className="font-body text-xs tracking-[0.2em] uppercase text-text-muted mb-2">
            {r.label}
          </dt>
          <dd
            className="font-display text-3xl sm:text-4xl font-800 leading-none tabular-nums"
            style={{ color: "var(--accent)" }}
          >
            {r.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
