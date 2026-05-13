import { MetadataRoute } from 'next';
import { getAllListings } from '@/lib/db';
import { listings as seedListings } from '@/data/listings';
import { getGuideSlugs } from '@/lib/guides';

// Regenerate every hour so new listings appear in Google's crawl queue
// without waiting for the next full deploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let listings;

  try {
    listings = await getAllListings();
  } catch {
    listings = seedListings;
  }

  if (listings.length === 0) {
    listings = seedListings;
  }

  // Only index pages that are publicly visible and crawlable
  const activeListings = listings.filter((l) => l.status === 'active');

  const listingRoutes = activeListings.map((listing) => ({
    url: `https://listbuyfly.com/listing/${listing.id}`,
    // Use the real listed/updated date so Google knows when the content changed
    lastModified: listing.listedDate ? new Date(listing.listedDate) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Guide routes from Notion CMS
  let guideSlugs: string[] = [];
  try {
    guideSlugs = await getGuideSlugs();
  } catch {
    guideSlugs = [];
  }

  const guideRoutes = guideSlugs.map((slug) => ({
    url: `https://listbuyfly.com/guides/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const staticRoutes = [
    {
      url: 'https://listbuyfly.com',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: 'https://listbuyfly.com/guides',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: 'https://listbuyfly.com/create',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: 'https://listbuyfly.com/terms',
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: 'https://listbuyfly.com/privacy',
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  return [...staticRoutes, ...listingRoutes, ...guideRoutes];
}
