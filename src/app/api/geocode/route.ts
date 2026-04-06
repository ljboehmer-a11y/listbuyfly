import { NextRequest, NextResponse } from 'next/server';

// Lightweight ZIP → lat/lng lookup using free zippopotam.us API
export async function GET(request: NextRequest) {
  const zip = request.nextUrl.searchParams.get('zip');
  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: 'Invalid ZIP code' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ error: 'ZIP code not found' }, { status: 404 });
    }
    const data = await res.json();
    const place = data.places?.[0];
    if (!place) {
      return NextResponse.json({ error: 'ZIP code not found' }, { status: 404 });
    }
    return NextResponse.json({
      lat: parseFloat(place.latitude),
      lng: parseFloat(place.longitude),
      city: place['place name'],
      state: place['state abbreviation'],
    });
  } catch {
    return NextResponse.json({ error: 'Geocode lookup failed' }, { status: 500 });
  }
}
