import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  // Gate: require x-admin-token header matching ADMIN_SETUP_SECRET.
  // Fails closed if the env var isn't set.
  const gate = requireAdminToken(request);
  if (gate) return gate;

  try {
    // Create listings table
    await sql`
      CREATE TABLE IF NOT EXISTS listings (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL,
        user_id TEXT,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER NOT NULL,
        price INTEGER NOT NULL,
        ttaf INTEGER DEFAULT 0,
        smoh INTEGER DEFAULT 0,
        tbo INTEGER DEFAULT 2000,
        engine TEXT NOT NULL,
        prop TEXT DEFAULT '',
        prop_time INTEGER DEFAULT 0,
        avionics TEXT DEFAULT '[]',
        logs_complete BOOLEAN DEFAULT false,
        annual_current BOOLEAN DEFAULT false,
        annual_date TEXT DEFAULT '',
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        n_number TEXT DEFAULT '',
        description TEXT DEFAULT '',
        exterior_rating TEXT DEFAULT '',
        interior_rating TEXT DEFAULT '',
        useful_load INTEGER DEFAULT 0,
        fuel_capacity INTEGER DEFAULT 0,
        damage_history BOOLEAN DEFAULT false,
        images TEXT DEFAULT '[]',
        seller_name TEXT NOT NULL,
        seller_phone TEXT NOT NULL,
        seller_email TEXT NOT NULL,
        listed_date TEXT NOT NULL,
        featured BOOLEAN DEFAULT false,
        tier TEXT DEFAULT 'free',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create leads table
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        listing_id TEXT REFERENCES listings(id),
        buyer_name TEXT NOT NULL,
        buyer_email TEXT NOT NULL,
        buyer_phone TEXT NOT NULL,
        message TEXT DEFAULT '',
        marketing_consent BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Add marketing_consent column if it doesn't exist (migration for existing DBs)
    await sql`
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false
    `;

    // Add show_contact_info column — sellers can opt out of displaying contact
    // info publicly. Default true preserves existing behavior for listings
    // created before this column existed.
    await sql`
      ALTER TABLE listings ADD COLUMN IF NOT EXISTS show_contact_info BOOLEAN NOT NULL DEFAULT true
    `;

    // Relax NOT NULL on seller contact fields — they're now optional
    await sql`ALTER TABLE listings ALTER COLUMN seller_name SET DEFAULT ''`;
    await sql`ALTER TABLE listings ALTER COLUMN seller_phone SET DEFAULT ''`;
    await sql`ALTER TABLE listings ALTER COLUMN seller_email SET DEFAULT ''`;

    // Indexes on frequently-queried columns. Without these, the homepage
    // "active listings" query, dashboard "my listings" query, and lead
    // lookups become full table scans as the DB grows. Creating them up
    // front is cheap at zero rows; doing it later under load is painful.
    // IF NOT EXISTS keeps this idempotent so re-running /api/db/setup is safe.
    await sql`CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_listings_listed_date ON listings(listed_date DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_listing_id ON leads(listing_id)`;

    return NextResponse.json({
      success: true,
      message: 'Tables and indexes created',
    });
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create tables',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
