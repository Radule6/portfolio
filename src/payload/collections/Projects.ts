import type { CollectionConfig } from "payload"
import { autoSlug } from "../hooks/auto-slug"
import { revalidateProject, revalidateProjectDelete } from "../hooks/revalidate-project"

export const Projects: CollectionConfig = {
  slug: "projects",
  labels: { singular: "Project", plural: "Projects" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "company", "lifecycle", "status", "order", "publishedAt"],
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
    {
      name: "description",
      type: "textarea",
      required: true,
      admin: {
        description:
          "Doubles as homepage card subhead, case-study hero tagline, and SEO description.",
      },
    },
    {
      name: "problem",
      type: "richText",
      admin: {
        description:
          "What problem does this project solve? Renders as the Problem section of the case study.",
      },
    },
    {
      name: "approach",
      type: "richText",
      admin: {
        description:
          "How was it built? Renders as the Approach section of the case study.",
      },
    },
    {
      name: "diagram",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Optional architecture diagram, rendered above the Approach text.",
      },
    },
    {
      name: "decisions",
      type: "array",
      admin: {
        description: "Key technical decisions, rendered as a Q-and-A list.",
      },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "rationale", type: "richText", required: true },
      ],
    },
    {
      name: "results",
      type: "array",
      admin: {
        description: "Outcomes / metrics, rendered as metric cards.",
      },
      fields: [
        { name: "label", type: "text", required: true },
        {
          name: "value",
          type: "text",
          required: true,
          admin: {
            description: "Encode unit inline, e.g. \"150ms p99\" or \"-40%\".",
          },
        },
      ],
    },
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
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "caption", type: "text" },
      ],
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
      name: "lifecycle",
      type: "select",
      required: true,
      defaultValue: "live",
      options: [
        { label: "Live", value: "live" },
        { label: "Archived", value: "archived" },
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
    {
      name: "dateBuilt",
      type: "date",
      admin: {
        position: "sidebar",
        description: "When the project was built (year shown in case-study hero).",
      },
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
        description: "When this case-study page was published.",
      },
    },
    {
      name: "relatedProjects",
      type: "relationship",
      relationTo: "projects",
      hasMany: true,
      maxRows: 3,
      filterOptions: ({ id }: { id: string | number | undefined }) =>
        id === undefined ? true : { id: { not_equals: id } },
      admin: {
        description: "Pick up to 3 related projects to show at the bottom of this page.",
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
