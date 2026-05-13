import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/db/',        // admin DDL/seed endpoints
        '/api/upload',     // internal image upload
        '/api/stripe/',    // payment and webhook handlers
        '/api/geocode',    // internal geocoding utility
        '/api/cron/',      // cron job endpoints
        '/api/leads',      // buyer PII (name, email, phone) — POST only, nothing to crawl
        '/api/listings/view', // internal view-counter POST, not indexable content
        '/dashboard',      // authenticated seller dashboard
      ],
    },
    sitemap: 'https://listbuyfly.com/sitemap.xml',
  };
}
