import Script from "next/script"
import { ThemeProvider } from "@/components/ThemeProvider/ThemeProvider"
import { personJsonLd } from "@/lib/structured-data"

// Frontend-only layout. Wraps public pages (/, /projects/[slug], future /blog)
// with the theme provider and SEO JSON-LD. The Payload admin lives under the
// (payload) route group and intentionally does NOT inherit any of this — its
// own RootLayout from @payloadcms/next/layouts handles its providers.
export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Script
        id="ld-json-person"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
    </ThemeProvider>
  )
}
