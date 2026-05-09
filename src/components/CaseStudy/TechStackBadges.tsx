export type TechStackBadgesProps = {
  tags: { label: string }[] | null | undefined
}

export default function TechStackBadges({ tags }: TechStackBadgesProps) {
  if (!tags || tags.length === 0) return null
  return (
    <ul role="list" className="flex flex-wrap gap-2 mb-12">
      {tags.map((t) => (
        <li
          key={t.label}
          className="font-body text-xs tracking-wide px-3 py-1 rounded-full border border-border text-text-muted"
        >
          {t.label}
        </li>
      ))}
    </ul>
  )
}
