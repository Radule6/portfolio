import type { CollectionConfig } from "payload"
import { autoSlug } from "../hooks/auto-slug"
import { revalidateProject, revalidateProjectDelete } from "../hooks/revalidate-project"

export const Projects: CollectionConfig = {
  slug: "projects",
  labels: { singular: "Project", plural: "Projects" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "company", "status", "order", "publishedAt"],
    group: "Content",
    listSearchableFields: ["title", "slug", "company"],
  },
  defaultSort: "order",
  hooks: {
    beforeChange: [autoSlug("title")],
    afterChange: [revalidateProject],
    afterDelete: [revalidateProjectDelete],
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
    { name: "description", type: "textarea", required: true },
    { name: "body", type: "richText" },
    {
      name: "tags",
      type: "array",
      fields: [{ name: "label", type: "text", required: true }],
    },
    {
      name: "accentColor",
      type: "text",
      required: true,
      defaultValue: "#59FFCE",
      admin: { description: "Hex color, e.g. #59FFCE" },
    },
    { name: "heroImage", type: "upload", relationTo: "media" },
    {
      name: "gallery",
      type: "array",
      fields: [{ name: "image", type: "upload", relationTo: "media", required: true }],
    },
    { name: "liveUrl", type: "text" },
    { name: "repoUrl", type: "text" },
    { name: "company", type: "text" },
    { name: "role", type: "text" },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "published",
      options: [
        { label: "Published", value: "published" },
        { label: "Coming soon", value: "coming-soon" },
        { label: "Draft", value: "draft" },
      ],
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: {
        position: "sidebar",
        description: "Manual sort on homepage (lower first)",
      },
    },
    { name: "publishedAt", type: "date", admin: { position: "sidebar" } },
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
