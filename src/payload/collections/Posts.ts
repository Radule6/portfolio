import type { CollectionConfig } from "payload"
import { autoSlug } from "../hooks/auto-slug"
import { computeReadingTime } from "../hooks/reading-time"
import { revalidatePost, revalidatePostDelete } from "../hooks/revalidate-post"

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Post", plural: "Posts" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "publishedAt", "readingTime"],
    group: "Content",
    listSearchableFields: ["title", "slug"],
    description: "Blog posts. Public /blog routes are added in Plan 4.",
  },
  defaultSort: "-publishedAt",
  hooks: {
    beforeChange: [autoSlug("title"), computeReadingTime],
    afterChange: [revalidatePost],
    afterDelete: [revalidatePostDelete],
  },
  fields: [
    { name: "title", type: "text", required: true, index: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { position: "sidebar" },
    },
    {
      name: "excerpt",
      type: "textarea",
      required: true,
      admin: { description: "Used in listing cards and as default <meta description>" },
    },
    { name: "body", type: "richText", required: true },
    { name: "coverImage", type: "upload", relationTo: "media", required: true },
    {
      name: "tags",
      type: "array",
      fields: [{ name: "label", type: "text", required: true }],
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
      required: true,
      admin: { position: "sidebar" },
    },
    {
      name: "publishedAt",
      type: "date",
      required: true,
      admin: { position: "sidebar" },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
    },
    {
      name: "readingTime",
      type: "number",
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Auto-computed from body word count",
      },
    },
    {
      name: "seo",
      type: "group",
      fields: [
        { name: "title", type: "text" },
        { name: "description", type: "textarea" },
        { name: "ogImage", type: "upload", relationTo: "media" },
      ],
    },
  ],
  timestamps: true,
}
