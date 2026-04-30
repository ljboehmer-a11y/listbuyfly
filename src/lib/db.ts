import { sql } from '@vercel/postgres';
import type { Listing } from './types';

// Convert a DB row (snake_case) to a Listing object (camelCase)
function rowToListing(row: any): Listing {
  return {
    id: row.id,
    slug: row.slug,
    make: row.make,
    model: row.model,
    year: row.year,
    price: row.price,
    ttaf: row.ttaf,
    smoh: row.smoh,
    tbo: row.tbo,
    engine: row.engine,
    prop: row.prop,
    propTime: row.prop_time,
    avionics: JSON.parse(row.avionics || '[]'),
    logsComplete: row.logs_complete,
    annualCurrent: row.annual_current,
    annualDate: row.annual_date,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code || '',
    nNumber: row.n_number,
    description: row.description,
    exteriorRating: row.exterior_rating,
    interiorRating: row.interior_rating,
    usefulLoad: row.useful_load,
    fuelCapacity: row.fuel_capacity,
    damageHistory: row.damage_history,
    damageContext: row.damage_context || '',
    images: JSON.parse(row.images || '[]'),
    sellerName: row.seller_name,
    sellerPhone: row.seller_phone,
    sellerEmail: row.seller_email,
    // Default true for existing rows that pre-date this column
    showContactInfo: row.show_contact_info ?? true,
    listedDate: row.listed_date,
    featured: row.featured,
    tier: row.tier,
    status: row.status || 'active',
    userId: row.user_id || undefined,
    viewCount: row.view_count ?? 0,
  };
}

// Get all active listings (status = 'active')
export async function getAllListings(): Promise<Listing[]> {
  try {
    const result = await sql`
      SELECT * FROM listings WHERE status = 'active' ORDER BY listed_date DESC
    `;
    return result.rows.map(rowToListing);
  } catch (error) {
    console.error('Error getting all listings:', error);
    return [];
  }
}

// Fetch only the owner user_id for a listing (cheaper than getListingById when
// you only need to authorize a write). Returns null if the listing doesn't exist,
// or undefined if the listing exists but has no owner (legacy seed data).
export async function getListingOwnerId(id: string): Promise<string | null | undefined> {
  try {
    const result = await sql`
      SELECT user_id FROM listings WHERE id = ${id}
    `;
    if (result.rows.length === 0) return null;
    return result.rows[0].user_id ?? undefined;
  } catch (error) {
    console.error('Error getting listing owner:', error);
    return null;
  }
}

// Get a single listing by ID (any status)
export async function getListingById(id: string): Promise<Listing | null> {
  try {
    const result = await sql`
      SELECT * FROM listings WHERE id = ${id}
    `;
    if (result.rows.length === 0) {
      return null;
    }
    return rowToListing(result.rows[0]);
  } catch (error) {
    console.error('Error getting listing by ID:', error);
    return null;
  }
}

// Get all listings for a specific user (by userId, for future Clerk)
export async function getListingsByUserId(userId: string): Promise<Listing[]> {
  try {
    const result = await sql`
      SELECT * FROM listings WHERE user_id = ${userId} ORDER BY listed_date DESC
    `;
    return result.rows.map(rowToListing);
  } catch (error) {
    console.error('Error getting listings by user ID:', error);
    return [];
  }
}

// Create a new listing, returns the created listing
export async function createListing(
  data: Partial<Listing> & { userId?: string }
): Promise<Listing> {
  try {
    const id = Date.now().toString();
    const slug = `${data.year}-${data.make}-${data.model}-${id}`
      .toLowerCase()
      .replace(/\s+/g, '-');

    // Default status to 'active' if not provided
    const status = data.status || 'active';

    const result = await sql`
      INSERT INTO listings (
        id,
        slug,
        user_id,
        make,
        model,
        year,
        price,
        ttaf,
        smoh,
        tbo,
        engine,
        prop,
        prop_time,
        avionics,
        logs_complete,
        annual_current,
        annual_date,
        city,
        state,
        zip_code,
        n_number,
        description,
        exterior_rating,
        interior_rating,
        useful_load,
        fuel_capacity,
        damage_history,
        damage_context,
        images,
        seller_name,
        seller_phone,
        seller_email,
        show_contact_info,
        listed_date,
        featured,
        status,
        tier
      ) VALUES (
        ${id},
        ${slug},
        ${data.userId || null},
        ${data.make || ''},
        ${data.model || ''},
        ${data.year || 0},
        ${data.price || 0},
        ${data.ttaf || 0},
        ${data.smoh || 0},
        ${data.tbo || 2000},
        ${data.engine || ''},
        ${data.prop || ''},
        ${data.propTime || 0},
        ${JSON.stringify(data.avionics || [])},
        ${data.logsComplete || false},
        ${data.annualCurrent || false},
        ${data.annualDate || ''},
        ${data.city || ''},
        ${data.state || ''},
        ${data.zipCode || ''},
        ${data.nNumber || ''},
        ${data.description || ''},
        ${data.exteriorRating || ''},
        ${data.interiorRating || ''},
        ${data.usefulLoad || 0},
        ${data.fuelCapacity || 0},
        ${data.damageHistory || false},
        ${data.damageContext || ''},
        ${JSON.stringify(data.images || [])},
        ${data.sellerName || ''},
        ${data.sellerPhone || ''},
        ${data.sellerEmail || ''},
        ${data.showContactInfo ?? true},
        ${new Date().toISOString().split('T')[0]},
        false,
        ${status},
        ${data.tier || 'free'}
      )
      RETURNING *
    `;

    return rowToListing(result.rows[0]);
  } catch (error) {
    console.error('Error creating listing:', error);
    throw error;
  }
}

// Update a listing — full overwrite approach to work with @vercel/postgres tagged templates
export async function updateListing(
  id: string,
  data: Partial<Listing>
): Promise<Listing | null> {
  try {
    // Fetch existing listing first, then merge updates
    const existing = await getListingById(id);
    if (!existing) return null;

    const merged = { ...existing, ...data };

    const result = await sql`
      UPDATE listings SET
        make = ${merged.make},
        model = ${merged.model},
        year = ${merged.year},
        price = ${merged.price},
        ttaf = ${merged.ttaf},
        smoh = ${merged.smoh},
        tbo = ${merged.tbo},
        engine = ${merged.engine},
        prop = ${merged.prop},
        prop_time = ${merged.propTime},
        avionics = ${JSON.stringify(merged.avionics)},
        logs_complete = ${merged.logsComplete},
        annual_current = ${merged.annualCurrent},
        annual_date = ${merged.annualDate},
        city = ${merged.city},
        state = ${merged.state},
        zip_code = ${merged.zipCode || ''},
        n_number = ${merged.nNumber},
        description = ${merged.description},
        exterior_rating = ${merged.exteriorRating},
        interior_rating = ${merged.interiorRating},
        useful_load = ${merged.usefulLoad},
        fuel_capacity = ${merged.fuelCapacity},
        damage_history = ${merged.damageHistory},
        damage_context = ${merged.damageContext || ''},
        images = ${JSON.stringify(merged.images)},
        seller_name = ${merged.sellerName},
        seller_phone = ${merged.sellerPhone},
        seller_email = ${merged.sellerEmail},
        show_contact_info = ${merged.showContactInfo ?? true},
        featured = ${merged.featured},
        tier = ${merged.tier},
        status = ${merged.status},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.rows.length === 0) return null;
    return rowToListing(result.rows[0]);
  } catch (error) {
    console.error('Error updating listing:', error);
    throw error;
  }
}

// Update listing status (active, inactive, sold)
export async function updateListingStatus(id: string, status: string): Promise<boolean> {
  try {
    const result = await sql`
      UPDATE listings SET status = ${status}, updated_at = NOW() WHERE id = ${id}
    `;
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Error updating listing status:', error);
    return false;
  }
}

// Create a lead
export async function createLead(data: {
  listingId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  message: string;
  marketingConsent?: boolean;
}): Promise<{ id: string }> {
  try {
    const id = Date.now().toString();
    const consent = data.marketingConsent ?? false;
    const result = await sql`
      INSERT INTO leads (id, listing_id, buyer_name, buyer_email, buyer_phone, message, marketing_consent)
      VALUES (${id}, ${data.listingId}, ${data.buyerName}, ${data.buyerEmail}, ${data.buyerPhone}, ${data.message}, ${consent})
      RETURNING id
    `;
    return { id: result.rows[0].id };
  } catch (error) {
    console.error('Error creating lead:', error);
    throw error;
  }
}

// Get lead count for a user's listings
export async function getLeadCountForUser(userId: string): Promise<number> {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM leads l
      INNER JOIN listings li ON l.listing_id = li.id
      WHERE li.user_id = ${userId}
    `;
    return parseInt(result.rows[0].count) || 0;
  } catch (error) {
    console.error('Error getting lead count:', error);
    return 0;
  }
}

// Increment view count for a listing. Fire-and-forget — errors are logged
// but never surfaced to the caller so a DB hiccup can't break page loads.
export async function incrementViewCount(id: string): Promise<void> {
  try {
    await sql`
      UPDATE listings SET view_count = view_count + 1 WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
}

// Get leads for a listing
export async function getLeadsForListing(listingId: string): Promise<any[]> {
  try {
    const result = await sql`
      SELECT * FROM leads WHERE listing_id = ${listingId} ORDER BY created_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('Error getting leads for listing:', error);
    return [];
  }
}

// Get all leads for a user across all their listings (with listing info)
export async function getLeadsForUser(userId: string): Promise<any[]> {
  try {
    const result = await sql`
      SELECT
        l.id, l.buyer_name, l.buyer_email, l.buyer_phone, l.message,
        l.marketing_consent, l.created_at,
        li.id as listing_id, li.year, li.make, li.model, li.n_number
      FROM leads l
      INNER JOIN listings li ON l.listing_id = li.id
      WHERE li.user_id = ${userId}
      ORDER BY l.created_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('Error getting leads for user:', error);
    return [];
  }
}
