import { MetadataRoute } from 'next';
import { listings } from '@/data/listings';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://listbuyfly.com';

  // Home page
  const pages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/create`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Individual listing pages
  const listingPages = listings.map((listing) => ({
    url: `${baseUrl}/listing/${listing.id}`,
    lastModified: new Date(listing.listedDate),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...pages, ...listingPages];
}
