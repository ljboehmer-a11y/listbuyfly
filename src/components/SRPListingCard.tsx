'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, Heart } from 'lucide-react';
import { Listing } from '@/lib/types';
import ImageCarousel from '@/components/ImageCarousel';
import { getListingImages } from '@/data/aircraftImages';
import SRPLeadModal from '@/components/SRPLeadModal';

interface SRPListingCardProps {
  listing: Listing;
  index: number;
  isCompared: boolean;
  onToggleCompare: (id: string) => void;
  onBeforeNavigate: () => void;
}

export default function SRPListingCard({
  listing,
  index,
  isCompared,
  onToggleCompare,
  onBeforeNavigate,
}: SRPListingCardProps) {
  const [showLeadModal, setShowLeadModal] = useState(false);

  const images =
    listing.images && listing.images.length > 0
      ? listing.images
      : getListingImages(listing.id, listing.make);

  const isFeatured =
    listing.featured &&
    (!listing.featuredUntil || new Date(listing.featuredUntil) > new Date());

  const priceDisplay =
    listing.price && listing.price > 0
      ? `$${listing.price.toLocaleString()}`
      : 'Call for Price';

  const listingTitle = `${listing.year} ${listing.make} ${listing.model}`;

  const lastUpdate = (() => {
    const raw = listing.listedDate;
    if (!raw) return null;
    const d = new Date(raw);
    if (isNaN(d.getTime())) return null;
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
  })();

  return (
    <>
      <div
        className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col ${
          isCompared ? 'ring-2 ring-amber-500' : ''
        }`}
      >
        {/* Image — full width, links to ADP */}
        <Link
          href={`/listing/${listing.id}`}
          prefetch={index < 6}
          onClick={onBeforeNavigate}
          className="block aspect-[4/3] relative flex-shrink-0 overflow-hidden bg-slate-100"
        >
          <ImageCarousel
            images={images}
            alt={listingTitle}
            variant="card"
            featured={isFeatured}
          />
        </Link>

        {/* Content */}
        <div className="flex flex-col flex-1 px-4 pt-3 pb-4">

          {/* Title */}
          <Link
            href={`/listing/${listing.id}`}
            prefetch={index < 6}
            onClick={onBeforeNavigate}
            className="no-underline"
          >
            <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-snug hover:text-amber-600 transition-colors mb-1">
              {listingTitle}
            </h3>
          </Link>

          {/* N-number */}
          {listing.nNumber && (
            <p className="text-sm text-gray-500 mb-2">{listing.nNumber}</p>
          )}

          {/* Price */}
          <p className="text-2xl font-bold text-amber-500 mb-3">{priceDisplay}</p>

          {/* Amber divider */}
          <div className="h-px bg-amber-400 mb-3" />

          {/* Stats: TTAF + SMOH */}
          <div className="grid grid-cols-2 gap-x-4 mb-3">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">TTAF</p>
              <p className="font-bold text-slate-900 text-sm">
                {listing.ttaf > 0 ? listing.ttaf.toLocaleString() : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">SMOH</p>
              <p className="font-bold text-slate-900 text-sm">
                {listing.smoh > 0 ? listing.smoh.toLocaleString() : '—'}
              </p>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {listing.description}{' '}
              <Link
                href={`/listing/${listing.id}`}
                onClick={onBeforeNavigate}
                className="font-semibold text-slate-900 underline whitespace-nowrap"
              >
                More Info
              </Link>
            </p>
          )}

          {/* Badges */}
          {(listing.logsComplete || listing.annualCurrent || !listing.damageHistory) && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {listing.logsComplete && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-xs font-medium">
                  ✓ Logs
                </span>
              )}
              {listing.annualCurrent && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-xs font-medium">
                  ✓ Annual
                </span>
              )}
              {!listing.damageHistory && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-xs font-medium">
                  ✓ Clean
                </span>
              )}
            </div>
          )}

          {/* Gray divider */}
          <div className="h-px bg-gray-200 mb-3" />

          {/* Location + Engine */}
          <div className="flex justify-between text-xs text-gray-500 mb-3">
            <span>{listing.city}, {listing.state}</span>
            <span className="text-right">{listing.engine}</span>
          </div>

          {/* Seller name + circular contact buttons */}
          <div className="flex items-center justify-between mb-3">
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-sm truncate">
                {listing.sellerName || 'Private Seller'}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0 ml-2">
              {/* Phone — links to ADP contact section (phone stripped from list response) */}
              <Link
                href={`/listing/${listing.id}#contact`}
                onClick={onBeforeNavigate}
                className="w-10 h-10 rounded-full border-2 border-slate-800 flex items-center justify-center text-slate-800 hover:bg-slate-800 hover:text-white transition-colors"
                title="Call seller"
              >
                <Phone className="w-4 h-4" />
              </Link>
              {/* Email — opens lead modal */}
              <button
                onClick={() => setShowLeadModal(true)}
                className="w-10 h-10 rounded-full border-2 border-slate-800 flex items-center justify-center text-slate-800 hover:bg-slate-800 hover:text-white transition-colors"
                title="Email seller"
              >
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Compare + Save */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={() => onToggleCompare(listing.id)}
              className={`flex items-center justify-center gap-2 border rounded-lg py-2 text-xs font-bold transition-colors ${
                isCompared
                  ? 'bg-amber-500 border-amber-500 text-slate-900'
                  : 'border-gray-300 text-slate-700 hover:border-slate-700'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 border-2 rounded-sm flex items-center justify-center flex-shrink-0 ${
                  isCompared ? 'border-slate-900 bg-white' : 'border-gray-400'
                }`}
              >
                {isCompared && (
                  <svg viewBox="0 0 10 8" className="w-2 h-1.5 fill-none stroke-slate-900 stroke-2">
                    <polyline points="1,4 3.5,7 9,1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              COMPARE
            </button>
            <button
              onClick={() => onToggleCompare(listing.id)}
              className={`flex items-center justify-center gap-2 border rounded-lg py-2 text-xs font-bold transition-colors ${
                isCompared
                  ? 'bg-amber-500 border-amber-500 text-slate-900'
                  : 'border-gray-300 text-slate-700 hover:border-slate-700'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isCompared ? 'fill-slate-900 stroke-slate-900' : ''}`} />
              SAVE
            </button>
          </div>

          {/* Last Update */}
          {lastUpdate && (
            <p className="text-center text-[11px] text-gray-400 mt-1">
              Last Update: {lastUpdate}
            </p>
          )}
        </div>
      </div>

      {showLeadModal && (
        <SRPLeadModal
          listingId={listing.id}
          listingTitle={listingTitle}
          onClose={() => setShowLeadModal(false)}
        />
      )}
    </>
  );
}
