import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload"
import { revalidatePath } from "next/cache"

export const revalidateProject: CollectionAfterChangeHook = ({ doc, previousDoc, req: { context } }) => {
  if (context?.disableRevalidate) return doc
  revalidatePath("/")
  if (doc?.slug) revalidatePath(`/projects/${doc.slug}`)
  if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
    revalidatePath(`/projects/${previousDoc.slug}`)
  }
  return doc
}

export const revalidateProjectDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (context?.disableRevalidate) return doc
  revalidatePath("/")
  if (doc?.slug) revalidatePath(`/projects/${doc.slug}`)
  return doc
}
