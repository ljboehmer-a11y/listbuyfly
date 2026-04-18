import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getListingOwnerId, updateListingStatus } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * Before mutating a listing from a Stripe webhook, verify that the listing's
 * stored user_id matches the userId that was in the Stripe metadata at checkout
 * time. If they disagree (or the listing is gone, or has no owner), we skip the
 * mutation and log loudly. This prevents a webhook replay / metadata mismatch
 * from flipping someone else's listing live.
 */
async function ownershipMatches(
  listingId: string,
  metadataUserId: string
): Promise<boolean> {
  try {
    const ownerId = await getListingOwnerId(listingId);
    if (ownerId === null) {
      console.warn(
        `Stripe webhook: listing ${listingId} not found — refusing to mutate.`
      );
      return false;
    }
    if (!ownerId) {
      console.warn(
        `Stripe webhook: listing ${listingId} has no owner on record — refusing to mutate.`
      );
      return false;
    }
    if (ownerId !== metadataUserId) {
      console.warn(
        `Stripe webhook: listing ${listingId} owner=${ownerId} does not match metadata userId=${metadataUserId} — refusing to mutate.`
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error(
      `Stripe webhook: ownership check failed for listing ${listingId}:`,
      err
    );
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const listingId = session.metadata?.listingId;
      const userId = session.metadata?.userId;

      if (listingId && userId) {
        // Verify the listing in the DB is actually owned by the userId that
        // was stamped into Stripe metadata at checkout time. If not, skip.
        const ok = await ownershipMatches(listingId, userId);
        if (ok) {
          try {
            await updateListingStatus(listingId, 'active');
            console.log(
              `Listing ${listingId} activated after successful payment`
            );
          } catch (error) {
            console.error(`Failed to activate listing ${listingId}:`, error);
          }
        }
      }
    }

    // Handle customer.subscription.deleted
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as any;
      const listingId = subscription.metadata?.listingId;
      const userId = subscription.metadata?.userId;

      if (listingId && userId) {
        // Same ownership check before flipping someone's listing inactive.
        const ok = await ownershipMatches(listingId, userId);
        if (ok) {
          try {
            await updateListingStatus(listingId, 'inactive');
            console.log(
              `Listing ${listingId} deactivated after subscription cancellation`
            );
          } catch (error) {
            console.error(`Failed to deactivate listing ${listingId}:`, error);
          }
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
