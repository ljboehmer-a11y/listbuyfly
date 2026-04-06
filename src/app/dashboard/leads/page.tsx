import { auth } from '@clerk/nextjs/server';
import { getLeadsForUser, getListingsByUserId } from '@/lib/db';
import LeadsDashboardContent from '@/components/LeadsDashboardContent';

export default async function LeadsDashboardPage() {
  const { userId } = await auth();
  const leads = await getLeadsForUser(userId!);
  const listings = await getListingsByUserId(userId!);

  return <LeadsDashboardContent leads={leads} listings={listings} />;
}
