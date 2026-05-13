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
        '/dashboard',      // authenticated seller dashboard
      ],
    },
    sitemap: 'https://listbuyfly.com/sitemap.xml',
  };
}
