import { NextRequest, NextResponse } from 'next/server';
import { requireSameOrigin } from '@/lib/originCheck';
import { incrementViewCount } from '@/lib/db';

// POST /api/listings/view  { id: string }
// Called client-side from the ADP on every page load. No auth required —
// this is a public counter. requireSameOrigin is enough to block external
// bots from inflating counts via direct API calls.
export async function POST(request: NextRequest) {
  const originBlock = requireSameOrigin(request);
  if (originBlock) return originBlock;

  try {
    const { id } = await request.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });
    }

    await incrementViewCount(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    // Never let a view-count failure surface as an error to the client
    console.error('View count error:', error);
    return NextResponse.json({ ok: true });
  }
}
