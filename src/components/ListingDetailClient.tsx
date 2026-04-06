'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Listing } from '@/lib/types';
import ImageCarousel from './ImageCarousel';
import { getListingImages } from '@/data/aircraftImages';
import LeadCaptureForm from './LeadCaptureForm';

interface ListingDetailClientProps {
  listingId: string;
}

export default function ListingDetailClient({ listingId }: ListingDetailClientProps) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch('/api/listings')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data: Listing[]) => {
        const found = data.find((l) => l.id === listingId);
        if (found) {
          setListing(found);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [listingId]);

  if (loading) {
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
        <main className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader className="w-6 h-6 animate-spin" />
            <span className="text-lg">Loading listing...</span>
          </div>
        </main>
      </div>
    );
  }

  if (notFound || !listing) {
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
          <p className="text-gray-600">The aircraft listing you&apos;re looking for doesn&apos;t exist.</p>
        </main>
      </div>
    );
  }

  const engineLifePercent = listing.tbo > 0 ? (listing.smoh / listing.tbo) * 100 : 0;
  const engineLifeColor = (percent: number) => {
    if (percent > 70) return 'text-red-600 bg-red-50';
    if (percent > 40) return 'text-amber-600 bg-amber-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  const isPaid = listing.tier === 'paid';

  // User-created listings have uploaded images; fallback to Unsplash
  const listingImages = listing.images && listing.images.length > 0
    ? listing.images
    : getListingImages(listing.id, listing.make);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-amber-500 hover:text-amber-600 w-fit">
            <ArrowLeft className="w-5 h-5" />
            Back to Listings
          </Link>
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
            {/* Image Gallery */}
            <div className="mb-8">
              <ImageCarousel
                images={listingImages}
                alt={`${listing.year} ${listing.make} ${listing.model}`}
                variant="detail"
              />
            </div>
            {/* Thumbnail Strip */}
            <div className="flex gap-2 mb-8 overflow-x-auto">
              {listingImages.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${listing.year} ${listing.make} ${listing.model} thumbnail ${i + 1}`}
                  className="w-24 h-16 object-cover rounded-lg border-2 border-gray-200 hover:border-amber-500 cursor-pointer transition-colors flex-shrink-0"
                />
              ))}
            </div>

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

              {/* Engine Life Progress */}
              <div className={`p-4 rounded-lg ${engineLifeColor(engineLifePercent)} mb-8 border`}>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold">Engine Life Remaining</span>
                  <span className="text-lg font-bold">{(100 - engineLifePercent).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      engineLifePercent > 70
                        ? 'bg-red-500'
                        : engineLifePercent > 40
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(engineLifePercent, 100)}%` }}
                  />
                </div>
                <p className="text-sm mt-2 opacity-75">
                  {listing.smoh.toLocaleString()} hours since major overhaul of {listing.tbo} TBO
                </p>
              </div>
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
                    {listing.annualDate && (
                      <p className="text-sm text-gray-600">
                        Last annual: {new Date(listing.annualDate).toLocaleDateString()}
                      </p>
                    )}
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
            {listing.avionics && listing.avionics.length > 0 && (
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
            )}
          </div>

          {/* Right Column - Contact & CTA */}
          <div className="lg:col-span-1">
            {/* Contact Section */}
            {isPaid ? (
              <div className="bg-white border-2 border-amber-500 rounded-lg p-6 mb-6 sticky top-4">
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
            ) : (
              <div className="sticky top-4 mb-6">
                <LeadCaptureForm listingId={listing.id} />
              </div>
            )}

            {/* Additional Info */}
            <div className="bg-slate-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Aircraft Info</h3>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Year</p>
                  <p className="font-semibold text-slate-900">{listing.year}</p>
                </div>

                <div>
                  <p className="text-gray-600">Make</p>
                  <p className="font-semibold text-slate-900">{listing.make}</p>
                </div>

                <div>
                  <p className="text-gray-600">Model</p>
                  <p className="font-semibold text-slate-900">{listing.model}</p>
                </div>

                <div>
                  <p className="text-gray-600">Engine</p>
                  <p className="font-semibold text-slate-900">{listing.engine}</p>
                </div>

                {listing.prop && (
                  <div>
                    <p className="text-gray-600">Propeller</p>
                    <p className="font-semibold text-slate-900">{listing.prop}</p>
                  </div>
                )}

                {listing.propTime > 0 && (
                  <div>
                    <p className="text-gray-600">Prop Time</p>
                    <p className="font-semibold text-slate-900">{listing.propTime.toLocaleString()} hrs</p>
                  </div>
                )}

                <div>
                  <p className="text-gray-600">Interior Condition</p>
                  <p className="font-semibold text-slate-900">{listing.interiorRating}/10</p>
                </div>

                <div>
                  <p className="text-gray-600">Listed Date</p>
                  <p className="font-semibold text-slate-900">
                    {new Date(listing.listedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
