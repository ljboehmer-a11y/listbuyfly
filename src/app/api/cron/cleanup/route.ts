import { NextRequest, NextResponse } from 'next/server';
import { deleteStaleInactiveListings } from '@/lib/db';

// Daily cron: hard-delete listings that have been inactive for 90+ days.
// Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` when
// invoking configured cron jobs. We verify that header so external callers
// can't trigger mass deletion. Fails closed if CRON_SECRET isn't set.
export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const authHeader = request.headers.get('Authorization');

  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const deleted = await deleteStaleInactiveListings();
    console.log(`[cron/cleanup] Deleted ${deleted} stale inactive listing(s)`);
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error('[cron/cleanup] Error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
