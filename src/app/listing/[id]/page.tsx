import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, MapPin, Fuel, Users, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { listings as seedListings } from '@/data/listings';
import { Listing } from '@/lib/types';
import ADPImageGallery from '@/components/ADPImageGallery';
import { getListingImages } from '@/data/aircraftImages';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import FavoriteButton from '@/components/FavoriteButton';
import CompareButton from '@/components/CompareButton';
import { getListingById, getAllListings } from '@/lib/db';

// Dynamic rendering — every listing (including user-created) served on demand
export const dynamic = 'force-dynamic';

interface ListingPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  // Pre-render seed listings at build time
  return seedListings.map((listing) => ({
    id: listing.id,
  }));
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { id } = await params;

  let listing: Listing | null = null;
  try {
    listing = await getListingById(id);
  } catch {
    listing = seedListings.find((l) => l.id === id) || null;
  }

  if (!listing) {
    return {
      title: 'Aircraft Not Found',
      description: 'This aircraft listing could not be found.',
    };
  }

  const title = `${listing.year} ${listing.make} ${listing.model} ${listing.nNumber} - $${listing.price.toLocaleString()} | List Buy Fly`;
  const description = `${listing.year} ${listing.make} ${listing.model} for sale. ${listing.description}. TTAF: ${listing.ttaf}, SMOH: ${listing.smoh}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://listbuyfly.com/listing/${listing.id}`,
      images: [
        {
          url: 'https://listbuyfly.com/og-aircraft.png',
          width: 1200,
          height: 630,
          alt: `${listing.year} ${listing.make} ${listing.model}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;

  let listing: Listing | null = null;
  try {
    listing = await getListingById(id);
  } catch {
    // DB not available — try seed data fallback
    listing = seedListings.find((l) => l.id === id) || null;
  }

  // Block public access to unpaid or non-active listings
  if (!listing || listing.status === 'pending_payment') {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-slate-900 text-white border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href="/" className="flex items-center gap-2 text-amber-500 hover:text-amber-600 w-fit">
              <ArrowLeft className="w-5 h-5" />
              Back to Listings
            </Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Aircraft Not Found</h1>
          <p className="text-gray-600">The aircraft listing you&apos;re looking for doesn&apos;t exist or is not yet available.</p>
        </main>
      </div>
    );
  }

  const engineLifePercent = (listing.smoh / listing.tbo) * 100;

  const isPaid = listing.tier === 'paid';

  // User-created listings have images in the images array; seed listings use Unsplash
  const listingImages = listing.images && listing.images.length > 0
    ? listing.images
    : getListingImages(listing.id, listing.make);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-amber-500 hover:text-amber-600">
            <ArrowLeft className="w-5 h-5" />
            Back to Listings
          </Link>
          <div className="flex items-center gap-2">
            <FavoriteButton listingId={listing.id} />
            <CompareButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {listing.year} {listing.make} {listing.model}
          </h1>
          <div className="flex flex-wrap gap-4 text-lg text-gray-600">
            <span className="font-semibold">{listing.nNumber}</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-5 h-5" />
              {listing.city}, {listing.state}
            </span>
            <span className="text-2xl font-bold text-amber-500">
              ${listing.price.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery with Lightbox */}
            <ADPImageGallery
              images={listingImages}
              alt={`${listing.year} ${listing.make} ${listing.model}`}
            />

            {/* Description */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">About This Aircraft</h2>
              <p className="text-gray-700 leading-relaxed mb-6">{listing.description}</p>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Total Time</p>
                  <p className="text-2xl font-bold text-slate-900">{listing.ttaf.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Hours</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Engine Time</p>
                  <p className="text-2xl font-bold text-slate-900">{listing.smoh.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Since Major Overhaul</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Engine Life Used</p>
                  <p className="text-2xl font-bold text-slate-900">{engineLifePercent.toFixed(0)}%</p>
                  <p className="text-xs text-gray-500">Of TBO</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Useful Load</p>
                  <p className="text-2xl font-bold text-slate-900">{listing.usefulLoad.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Pounds</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Fuel Capacity</p>
                  <p className="text-2xl font-bold text-slate-900">{listing.fuelCapacity}</p>
                  <p className="text-xs text-gray-500">Gallons</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Exterior</p>
                  <p className="text-2xl font-bold text-slate-900">{listing.exteriorRating}/10</p>
                  <p className="text-xs text-gray-500">Condition</p>
                </div>
              </div>

              {/* Engine Time Summary */}
              <p className="text-sm text-gray-600 mb-8">
                {listing.smoh.toLocaleString()} hours since major overhaul &middot; TBO {listing.tbo.toLocaleString()} hours
              </p>
            </section>

            {/* Maintenance & Status */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Maintenance & Status</h2>
              <div className="space-y-3">
                <div
                  className={`flex items-center gap-3 p-4 rounded-lg border ${
                    listing.annualCurrent
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  {listing.annualCurrent ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold text-slate-900">
                      Annual Inspection: {listing.annualCurrent ? 'Current' : 'Expired'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Last annual: {new Date(listing.annualDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-3 p-4 rounded-lg border ${
                    listing.logsComplete
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  {listing.logsComplete ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold text-slate-900">
                      Maintenance Logs: {listing.logsComplete ? 'Complete' : 'Partial'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {listing.logsComplete
                        ? 'Full maintenance history available'
                        : 'Some maintenance records may be missing'}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-3 p-4 rounded-lg border ${
                    !listing.damageHistory
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  {!listing.damageHistory ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold text-slate-900">
                      Damage History: {!listing.damageHistory ? 'Clean' : 'Yes'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {!listing.damageHistory
                        ? 'No accident or damage history'
                        : 'This aircraft has a damage history'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Avionics */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Avionics</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {listing.avionics.map((avionics, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-gray-200 rounded-lg p-3 text-sm text-slate-900"
                  >
                    {avionics}
                  </div>
                ))}
              </div>
            </section>

            {/* Aircraft Info */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Aircraft Info</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Year</p>
                  <p className="font-semibold text-slate-900">{listing.year}</p>
                </div>
                <div className="bg-slate-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Make</p>
                  <p className="font-semibold text-slate-900">{listing.make}</p>
                </div>
                <div className="bg-slate-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Model</p>
                  <p className="font-semibold text-slate-900">{listing.model}</p>
                </div>
                <div className="bg-slate-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Engine</p>
                  <p className="font-semibold text-slate-900">{listing.engine}</p>
                </div>
                <div className="bg-slate-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Propeller</p>
                  <p className="font-semibold text-slate-900">{listing.prop}</p>
                </div>
                <div className="bg-slate-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Prop Time</p>
                  <p className="font-semibold text-slate-900">{listing.propTime.toLocaleString()} hrs</p>
                </div>
                <div className="bg-slate-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Interior Condition</p>
                  <p className="font-semibold text-slate-900">{listing.interiorRating}/10</p>
                </div>
                <div className="bg-slate-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Listed Date</p>
                  <p className="font-semibold text-slate-900">{new Date(listing.listedDate).toLocaleDateString()}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Contact & CTA */}
          <div className="lg:col-span-1">
            {/* Contact Section */}
            {isPaid ? (
              <div className="sticky top-4 space-y-6 mb-6">
                <div className="bg-white border-2 border-amber-500 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Contact Seller</h3>

                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Seller Name</p>
                      <p className="font-semibold text-slate-900">{listing.sellerName}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Phone</p>
                      <a
                        href={`tel:${listing.sellerPhone}`}
                        className="font-semibold text-amber-500 hover:text-amber-600"
                      >
                        {listing.sellerPhone}
                      </a>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <a
                        href={`mailto:${listing.sellerEmail}`}
                        className="font-semibold text-amber-500 hover:text-amber-600 break-all"
                      >
                        {listing.sellerEmail}
                      </a>
                    </div>
                  </div>

                  <a
                    href={`mailto:${listing.sellerEmail}?subject=Inquiry about ${listing.year} ${listing.make} ${listing.model}`}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 rounded-lg transition-colors block text-center"
                  >
                    Send Email
                  </a>
                </div>
                <LeadCaptureForm listingId={listing.id} defaultMarketingConsent={true} hideHeader={true} />
              </div>
            ) : (
              <div className="sticky top-4 mb-6">
                <LeadCaptureForm listingId={listing.id} defaultMarketingConsent={true} />
              </div>
            )}

          </div>
        </div>
      </main>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: `${listing.year} ${listing.make} ${listing.model}`,
            description: listing.description,
            image: 'https://listbuyfly.com/aircraft.png',
            brand: {
              '@type': 'Brand',
              name: listing.make,
            },
            offers: {
              '@type': 'Offer',
              url: `https://listbuyfly.com/listing/${listing.id}`,
              priceCurrency: 'USD',
              price: listing.price.toString(),
              availability: 'https://schema.org/InStock',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: ((parseInt(listing.exteriorRating) + parseInt(listing.interiorRating)) / 2).toString(),
              bestRating: '10',
              worstRating: '1',
            },
            identifier: listing.nNumber,
            sameAs: `https://listbuyfly.com/listing/${listing.id}`,
          }),
        }}
      />
    </div>
  );
}
