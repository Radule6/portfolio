import type { Metadata, Viewport } from "next"
import { Outfit, Syne } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider/ThemeProvider"
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} ${syne.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
