import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { updateListingStatus } from '@/lib/db';

export const runtime = 'nodejs';

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

    // Handle customer.subscription.deleted
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as any;
      const listingId = subscription.metadata?.listingId;
      const userId = subscription.metadata?.userId;

      if (listingId && userId) {
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

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
