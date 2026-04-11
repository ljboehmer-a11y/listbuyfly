import { MetadataRoute } from 'next';
import { getAllListings } from '@/lib/db';
import { listings as seedListings } from '@/data/listings';

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

  const staticRoutes = [
    {
      url: 'https://listbuyfly.com',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
  ];

  return [...staticRoutes, ...listingRoutes];
}
