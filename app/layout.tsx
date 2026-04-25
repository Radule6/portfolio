import type { Metadata, Viewport } from "next"
import { Outfit, Syne } from "next/font/google"
import "./globals.css"
import { siteConfig } from "@/lib/site-config"

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

// Root layout — only structure (html/body, fonts, default metadata).
// ThemeProvider and JSON-LD live in app/(frontend)/layout.tsx so they
// don't wrap the Payload admin (where re-renders trigger script-tag
// warnings and the theme/JSON-LD aren't relevant anyway).
//
// suppressHydrationWarning is required because next-themes (used in
// the (frontend) layout) mutates <html data-theme> before React hydrates.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} ${syne.variable}`}>
      <body>{children}</body>
    </html>
  )
}
