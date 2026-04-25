import { RichText as PayloadRichText } from "@payloadcms/richtext-lexical/react"
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical"

export default function RichText({ data }: { data: SerializedEditorState | undefined | null }) {
  if (!data) return null
  return (
    <div className="font-body text-text-secondary leading-relaxed space-y-5 [&_h2]:font-display [&_h2]:text-text-primary [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-700 [&_h2]:tracking-tight [&_h2]:mt-12 [&_h2]:mb-4 [&_h3]:font-display [&_h3]:text-text-primary [&_h3]:text-xl [&_h3]:font-600 [&_h3]:mt-8 [&_h3]:mb-3 [&_a]:text-accent-lime [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-accent-yellow [&_p]:text-base [&_p]:sm:text-lg [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_blockquote]:border-l-2 [&_blockquote]:border-accent-lime [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-text-primary [&_code]:font-mono [&_code]:text-sm [&_code]:bg-surface-raised [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-surface-raised [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_hr]:border-border [&_hr]:my-12">
      <PayloadRichText data={data} />
    </div>
  )
}
