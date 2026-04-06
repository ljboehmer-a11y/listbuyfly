import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'List Buy Fly — Aircraft Marketplace for Pilots',
  description: 'Buy and sell quality aircraft. A trusted marketplace for pilots seeking well-maintained aircraft with transparent pricing and detailed inspections.',
  metadataBase: new URL('https://listbuyfly.com'),
  openGraph: {
    title: 'List Buy Fly — Aircraft Marketplace for Pilots',
    description: 'Buy and sell quality aircraft. A trusted marketplace for pilots.',
    type: 'website',
    url: 'https://listbuyfly.com',
    siteName: 'List Buy Fly',
    images: [
      {
        url: 'https://listbuyfly.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'List Buy Fly - Aircraft Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'List Buy Fly — Aircraft Marketplace for Pilots',
    description: 'Buy and sell quality aircraft. A trusted marketplace for pilots.',
  },
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="canonical" href="https://listbuyfly.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
          <script
            src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
            async
            defer
          />
        )}
      </head>
      <body className="bg-white text-slate-900" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
