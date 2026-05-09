import type { Project } from "@/payload-types"
import { hasContent } from "@/lib/lexical-utils"

export type StaticParamCandidate = Pick<Project, "slug" | "problem" | "approach">

export function filterStaticParamsCandidates(
  docs: StaticParamCandidate[],
): { slug: string }[] {
  return docs
    .filter((d) => hasContent(d.problem) || hasContent(d.approach))
    .map((d) => ({ slug: d.slug }))
}
