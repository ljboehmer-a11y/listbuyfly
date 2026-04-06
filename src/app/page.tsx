import { Metadata } from 'next';
import { getAllListings } from '@/lib/db';
import { listings as seedListings } from '@/data/listings';
import HomeContent from '@/components/HomeContent';

// Revalidate every 30 seconds so new listings show up
export const revalidate = 30;

export const metadata: Metadata = {
  title: 'Browse Aircraft for Sale | List Buy Fly',
  description:
    'Browse quality aircraft for sale. Find your next Cessna, Piper, or other aircraft with complete maintenance records and detailed specifications.',
  openGraph: {
    title: 'Browse Aircraft for Sale | List Buy Fly',
    description: 'Find your next quality aircraft on the trusted marketplace.',
    type: 'website',
    url: 'https://listbuyfly.com',
  },
};

export default async function HomePage() {
  let listings;
  try {
    listings = await getAllListings();
  } catch {
    // Fallback to seed data if DB is not yet set up
    listings = seedListings;
  }

  // If DB returned empty (tables not seeded yet), fall back to seed data
  if (listings.length === 0) {
    listings = seedListings;
  }

  return <HomeContent listings={listings} />;
}
