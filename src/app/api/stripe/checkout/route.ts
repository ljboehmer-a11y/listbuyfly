import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe, STRIPE_PRICE_ID } from '@/lib/stripe';
import { getListingOwnerId } from '@/lib/db';
import { requireSameOrigin } from '@/lib/originCheck';

export async function POST(request: NextRequest) {
  try {
    const originBlock = requireSameOrigin(request);
    if (originBlock) return originBlock;

    // Require an authenticated Clerk session. The authoritative userId comes
    // from Clerk — we never trust a client-supplied userId.
    const { userId: authUserId } = await auth();
    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json(
        { error: 'listingId is required' },
        { status: 400 }
      );
    }

    // Verify the authenticated caller actually owns this listing before
    // starting a subscription tied to it.
    const ownerId = await getListingOwnerId(listingId);
    if (ownerId === null) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    if (ownerId !== authUserId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://listbuyfly.com';

    // Create a Stripe Checkout session with trusted metadata (userId from Clerk, not from body)
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?payment=success&listing=${listingId}`,
      cancel_url: `${appUrl}/dashboard?payment=cancelled`,
      metadata: {
        listingId,
        userId: authUserId,
      },
      subscription_data: {
        metadata: {
          listingId,
          userId: authUserId,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
