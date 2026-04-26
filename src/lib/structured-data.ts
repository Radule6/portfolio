import { siteConfig } from "./site-config"

export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.author,
  jobTitle: "Full-Stack Engineer",
  url: siteConfig.url,
  sameAs: [siteConfig.social.github, siteConfig.social.linkedin],
  knowsAbout: ["React", "Next.js", "TypeScript", "Python", "FastAPI", "AWS", "RAG", "AI"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Zagreb",
    addressCountry: "HR",
  },
} as const
