import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload"
import { revalidatePath } from "next/cache"

export const revalidatePost: CollectionAfterChangeHook = ({ doc, previousDoc, req: { context } }) => {
  if (context?.disableRevalidate) return doc
  revalidatePath("/blog")
  revalidatePath("/feed.xml")
  revalidatePath("/sitemap.xml")
  if (doc?.slug) revalidatePath(`/blog/${doc.slug}`)
  if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
    revalidatePath(`/blog/${previousDoc.slug}`)
  }
  return doc
}

export const revalidatePostDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (context?.disableRevalidate) return doc
  revalidatePath("/blog")
  revalidatePath("/feed.xml")
  revalidatePath("/sitemap.xml")
  if (doc?.slug) revalidatePath(`/blog/${doc.slug}`)
  return doc
}
