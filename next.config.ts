import type { NextConfig } from 'next'

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

export default nextConfig
