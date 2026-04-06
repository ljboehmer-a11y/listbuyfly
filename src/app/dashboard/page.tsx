import { auth } from '@clerk/nextjs/server';
import { getListingsByUserId, getLeadCountForUser } from '@/lib/db';
import DashboardContent from '@/components/DashboardContent';

export default async function DashboardPage() {
  const { userId } = await auth();
  // Middleware already protects this route, so userId is guaranteed
  const listings = await getListingsByUserId(userId!);
  const leadCount = await getLeadCountForUser(userId!);

  return <DashboardContent listings={listings} leadCount={leadCount} />;
}
