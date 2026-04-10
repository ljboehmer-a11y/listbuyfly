import { NextRequest, NextResponse } from 'next/server';
import { Listing } from '@/lib/types';
import { createListing, getAllListings, getListingById, updateListing, updateListingStatus } from '@/lib/db';

// Increase body size limit to handle base64 images (default is 1MB)
export const maxDuration = 30; // seconds
export const dynamic = 'force-dynamic';

// Validate promo code against env var (comma-separated list)
function isValidPromoCode(code: string | undefined): boolean {
  if (!code) return false;
  const validCodes = (process.env.PROMO_CODES || '').split(',').map((c) => c.trim().toUpperCase()).filter(Boolean);
  return validCodes.includes(code.toUpperCase());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      make,
      model,
      year,
      price,
      ttaf,
      smoh,
      tbo,
      engine,
      prop,
      propTime,
      avionics,
      logsComplete,
      annualCurrent,
      annualDate,
      city,
      state,
      zipCode,
      nNumber,
      description,
      exteriorRating,
      interiorRating,
      usefulLoad,
      fuelCapacity,
      damageHistory,
      images,
      sellerName,
      sellerPhone,
      sellerEmail,
      tier,
      userId,
      status,
      promoCode,
    } = body;

    // Validate required fields
    if (
      !make ||
      !model ||
      !year ||
      !price ||
      !engine ||
      !city ||
      !state ||
      !sellerName ||
      !sellerPhone ||
      !sellerEmail
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create listing in database
    // For premium listings, set status to 'pending_payment' initially
    // Status will be changed to 'active' after successful Stripe payment
    // If a valid promo code is provided, skip payment and activate immediately
    const promoValid = isValidPromoCode(promoCode);
    const listingStatus = tier === 'paid' ? (promoValid ? 'active' : 'pending_payment') : (status || 'active');

    const listing = await createListing({
      make,
      model,
      year,
      price,
      ttaf: ttaf || 0,
      smoh: smoh || 0,
      tbo: tbo || 0,
      engine,
      prop: prop || '',
      propTime: propTime || 0,
      avionics: avionics || [],
      logsComplete: logsComplete ?? false,
      annualCurrent: annualCurrent ?? false,
      annualDate: annualDate || '',
      city,
      state,
      zipCode: zipCode || '',
      nNumber: nNumber || '',
      description: description || '',
      exteriorRating: exteriorRating || '',
      interiorRating: interiorRating || '',
      usefulLoad: usefulLoad || 0,
      fuelCapacity: fuelCapacity || 0,
      damageHistory: damageHistory ?? false,
      images: images || [],
      sellerName,
      sellerPhone,
      sellerEmail,
      featured: false,
      tier: tier || 'free',
      userId: userId || null,
      status: listingStatus,
    } as any);

    console.log('New Listing Created:', {
      timestamp: new Date().toISOString(),
      id: listing.id,
      slug: listing.slug,
      make: listing.make,
      model: listing.model,
      year: listing.year,
      sellerEmail: listing.sellerEmail,
    });

    return NextResponse.json({ ...listing, promoApplied: promoValid }, { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // If an ID is provided, return a single listing
    if (id) {
      const listing = await getListingById(id);
      if (!listing) {
        return NextResponse.json(
          { error: 'Listing not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(listing, { status: 200 });
    }

    // Otherwise return all active listings
    const listings = await getAllListings();
    return NextResponse.json(listings, { status: 200 });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, tierUpgrade, tierDowngrade, promoCode, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // If only status is being changed, use the status-specific function
    if (status && Object.keys(updates).length === 0) {
      const validStatuses = ['active', 'inactive', 'sold', 'pending_payment'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
      await updateListingStatus(id, status);
      return NextResponse.json({ success: true, id, status }, { status: 200 });
    }

    // If this is a tier upgrade (free → paid), set status to pending_payment
    // The listing won't go live as premium until Stripe webhook confirms payment
    // If a valid promo code is provided, skip payment and activate immediately
    // If downgrading (paid → free), activate the listing immediately
    const promoValid = isValidPromoCode(promoCode);
    const effectiveStatus = tierUpgrade
      ? (promoValid ? 'active' : 'pending_payment')
      : tierDowngrade
        ? 'active'
        : (status || undefined);

    // Otherwise, update listing fields
    const listing = await updateListing(id, {
      ...updates,
      ...(effectiveStatus ? { status: effectiveStatus } : {}),
    });
    return NextResponse.json({ ...listing, promoApplied: promoValid }, { status: 200 });
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Listing ID and status are required' },
        { status: 400 }
      );
    }

    if (status !== 'inactive' && status !== 'sold') {
      return NextResponse.json(
        { error: "Status must be 'inactive' or 'sold'" },
        { status: 400 }
      );
    }

    await updateListingStatus(id, status);
    return NextResponse.json({ success: true, status }, { status: 200 });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}
