import { withPayload } from "@payloadcms/next/withPayload"

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      ...(process.env.SUPABASE_PROJECT_HOST
        ? [
            {
              protocol: "https",
              hostname: process.env.SUPABASE_PROJECT_HOST,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
}

export default withPayload(nextConfig)
