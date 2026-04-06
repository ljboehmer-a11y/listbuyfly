import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { listings } from '@/data/listings';

export async function GET() {
  try {
    let insertedCount = 0;

    for (const listing of listings) {
      await sql`
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
          n_number,
          description,
          exterior_rating,
          interior_rating,
          useful_load,
          fuel_capacity,
          damage_history,
          images,
          seller_name,
          seller_phone,
          seller_email,
          listed_date,
          featured,
          tier,
          status
        ) VALUES (
          ${listing.id},
          ${listing.slug},
          ${null},
          ${listing.make},
          ${listing.model},
          ${listing.year},
          ${listing.price},
          ${listing.ttaf},
          ${listing.smoh},
          ${listing.tbo},
          ${listing.engine},
          ${listing.prop},
          ${listing.propTime},
          ${JSON.stringify(listing.avionics)},
          ${listing.logsComplete},
          ${listing.annualCurrent},
          ${listing.annualDate},
          ${listing.city},
          ${listing.state},
          ${listing.nNumber},
          ${listing.description},
          ${listing.exteriorRating},
          ${listing.interiorRating},
          ${listing.usefulLoad},
          ${listing.fuelCapacity},
          ${listing.damageHistory},
          ${JSON.stringify(listing.images)},
          ${listing.sellerName},
          ${listing.sellerPhone},
          ${listing.sellerEmail},
          ${listing.listedDate},
          ${listing.featured},
          ${listing.tier},
          'active'
        )
        ON CONFLICT (id) DO NOTHING
      `;

      insertedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${insertedCount} listings`,
      count: insertedCount,
    });
  } catch (error) {
    console.error('Database seed error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to seed database',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
