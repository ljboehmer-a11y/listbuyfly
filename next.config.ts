import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  output: 'standalone',
  // isomorphic-dompurify pulls in jsdom, which uses native Node.js built-ins
  // (net, tls, fs, canvas, etc.). Turbopack can't bundle these — mark them as
  // server-external so they're required at runtime from node_modules instead.
  serverExternalPackages: ['isomorphic-dompurify', 'jsdom'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
}

export default withSentryConfig(nextConfig, {
  // Sentry project org and project name (set in Vercel env: SENTRY_ORG, SENTRY_PROJECT)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Auth token for uploading source maps so stack traces show real code.
  // Set SENTRY_AUTH_TOKEN in Vercel env (Settings → Environment Variables).
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload source maps in CI/Vercel builds only. Keeps local builds fast.
  silent: !process.env.CI,

  // Tree-shake Sentry debug code out of production bundles (webpack only).
  // disableLogger: true,

  // Automatically instrument route handlers and server components.
  // autoInstrumentServerFunctions: true, // webpack only, not Turbopack
})
