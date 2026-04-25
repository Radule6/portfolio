import type { CollectionConfig } from "payload"

export const Media: CollectionConfig = {
  slug: "media",
  upload: {
    mimeTypes: ["image/png", "image/jpeg", "image/webp", "image/avif", "image/svg+xml"],
  },
  admin: { defaultColumns: ["filename", "alt", "createdAt"] },
  access: { read: () => true },
  fields: [
    { name: "alt", type: "text", required: true, label: "Alt text" },
  ],
}
