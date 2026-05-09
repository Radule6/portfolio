import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical"
import RichText from "@/components/RichText/RichText"
import { accentStyle } from "@/lib/accent-style"

export type DecisionsListProps = {
  decisions: { title: string; rationale: SerializedEditorState }[] | null | undefined
  accentColor: string
}

export default function DecisionsList({ decisions, accentColor }: DecisionsListProps) {
  if (!decisions || decisions.length === 0) return null
  return (
    <ul role="list" style={accentStyle(accentColor)} className="space-y-8 my-12">
      {decisions.map((d, i) => (
        <li key={i} className="relative pl-6">
          <span
            aria-hidden="true"
            className="absolute left-0 top-2 h-2 w-2 rounded-full"
            style={{ background: "var(--accent)" }}
          />
          <h3 className="font-display text-xl text-text-primary font-700 mb-2">{d.title}</h3>
          <RichText data={d.rationale} />
        </li>
      ))}
    </ul>
  )
}
