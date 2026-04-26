import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Outfit, Syne } from "next/font/google"
import "../globals.css"
import { ThemeProvider } from "@/components/ThemeProvider/ThemeProvider"
import Preloader from "@/components/Preloader/Preloader"
import { siteConfig } from "@/lib/site-config"
import { personJsonLd } from "@/lib/structured-data"

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-outfit",
  display: "swap",
})

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.title, template: `%s — ${siteConfig.name}` },
  description: siteConfig.description,
  authors: [{ name: siteConfig.author }],
  alternates: { canonical: siteConfig.url },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.shortDescription,
    images: [{ url: siteConfig.ogImage, alt: siteConfig.author }],
    locale: siteConfig.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.shortDescription,
    images: [siteConfig.ogImage],
  },
  icons: { icon: "/favicon.png" },
}

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  width: "device-width",
  initialScale: 1,
}

// Frontend root layout. Uses the "multiple root layouts" pattern:
// app/layout.tsx does NOT exist; each route group ((frontend), (payload))
// is its own root and renders its own <html>/<body>. Payload's RootLayout
// (in app/(payload)/layout.tsx) does the same for the admin UI.
//
// suppressHydrationWarning is required because next-themes mutates
// <html data-theme> before React hydrates.
export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} ${syne.variable}`}>
      <body>
        <ThemeProvider>
          <Preloader />
          {children}
        </ThemeProvider>
        <Script
          id="ld-json-person"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  )
}
