import { MetadataRoute } from 'next';
import { getAllListings } from '@/lib/db';
import { listings as seedListings } from '@/data/listings';
import { getGuideSlugs } from '@/lib/guides';

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

  const listingRoutes = listings.map((listing) => ({
    url: `https://listbuyfly.com/listing/${listing.id}`,
    lastModified: new Date(),
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
  ];

  return [...staticRoutes, ...listingRoutes, ...guideRoutes];
}
