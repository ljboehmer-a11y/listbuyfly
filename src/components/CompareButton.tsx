'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, BarChart3 } from 'lucide-react';
import { Listing } from '@/lib/types';
import { getListingImages } from '@/data/aircraftImages';

function getFavorites(): string[] {
  try {
    const match = document.cookie.match(/(^| )lbf_favorites=([^;]+)/);
    if (match) return JSON.parse(decodeURIComponent(match[2]));
  } catch {}
  return [];
}

function setFavoritesCookie(ids: string[]) {
  const expires = new Date(Date.now() + 90 * 864e5).toUTCString();
  document.cookie = `lbf_favorites=${encodeURIComponent(JSON.stringify(ids))}; expires=${expires}; path=/; SameSite=Lax`;
}

export default function CompareButton() {
  const [favCount, setFavCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  // Poll cookie for count (updates when FavoriteButton changes it)
  useEffect(() => {
    setMounted(true);
    const update = () => setFavCount(getFavorites().length);
    update();
    const interval = setInterval(update, 500);
    return () => clearInterval(interval);
  }, []);

  const openCompare = useCallback(async () => {
    const favIds = getFavorites();
    if (favIds.length < 2) return;

    setLoading(true);
    setShowModal(true);

    try {
      // Fetch each favorited listing
      const results = await Promise.all(
        favIds.map(async (id) => {
          const res = await fetch(`/api/listings?id=${id}`);
          if (!res.ok) return null;
          return res.json();
        })
      );
      setListings(results.filter(Boolean) as Listing[]);
    } catch (err) {
      console.error('Failed to fetch compare listings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeListing = (id: string) => {
    const favs = getFavorites().filter((f) => f !== id);
    setFavoritesCookie(favs);
    setFavCount(favs.length);
    setListings((prev) => prev.filter((l) => l.id !== id));
    if (favs.length < 2) setShowModal(false);
  };

  const clearAll = () => {
    setFavoritesCookie([]);
    setFavCount(0);
    setListings([]);
    setShowModal(false);
  };

  if (!mounted || favCount < 1) return null;

  // engineLifePercent/color removed — not seller-friendly

  return (
    <>
      <button
        onClick={openCompare}
        disabled={favCount < 2}
        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium shadow-sm transition-all ${
          favCount >= 2
            ? 'bg-white border border-gray-200 text-slate-700 hover:border-amber-400'
            : 'bg-white/50 border border-gray-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        <BarChart3 className="w-5 h-5" />
        <span className="hidden sm:inline">Compare {favCount >= 2 ? `(${favCount})` : ''}</span>
        <span className="sm:hidden text-xs font-bold">{favCount}</span>
      </button>

      {/* Compare Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center overflow-y-auto py-8" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-900 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
              <h2 className="text-xl font-bold">Side-by-Side Comparison</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500">Loading comparison...</div>
            ) : listings.length >= 2 ? (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-32" />
                    {listings.map((l) => (
                      <col key={l.id} />
                    ))}
                  </colgroup>
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="p-4 text-left text-sm font-medium text-slate-500">Spec</th>
                      {listings.map((l) => (
                        <th key={l.id} className="p-4 text-center">
                          <div className="aspect-[4/3] rounded-lg mb-3 overflow-hidden">
                            <img
                              src={l.images && l.images.length > 0 ? l.images[0] : getListingImages(l.id, l.make)[0]}
                              alt={`${l.year} ${l.make} ${l.model}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <a href={`/listing/${l.id}`} className="text-slate-900 font-bold hover:text-amber-500 transition-colors">
                            {l.year} {l.make} {l.model}
                          </a>
                          <p className="text-xs text-gray-500 mt-1">{l.nNumber}</p>
                          <button onClick={() => removeListing(l.id)} className="text-xs text-red-500 hover:text-red-600 mt-2">
                            Remove
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Price', render: (l: Listing) => <span className="text-xl font-bold text-amber-500">{l.price && l.price > 0 ? `$${l.price.toLocaleString()}` : 'Call/Email for Price'}</span>, bg: true },
                      { label: 'Year', render: (l: Listing) => <span>{l.year}</span> },
                      { label: 'TTAF', render: (l: Listing) => { const low = Math.min(...listings.map(c => c.ttaf)); return <span className={l.ttaf === low ? 'text-emerald-600 font-bold' : ''}>{l.ttaf.toLocaleString()} hrs{l.ttaf === low ? ' ★' : ''}</span>; }, bg: true },
                      { label: 'SMOH', render: (l: Listing) => { const low = Math.min(...listings.map(c => c.smoh)); return <span className={l.smoh === low ? 'text-emerald-600 font-bold' : ''}>{l.smoh.toLocaleString()} hrs{l.smoh === low ? ' ★' : ''}</span>; } },
                      { label: 'TBO', render: (l: Listing) => <span>{l.tbo.toLocaleString()} hrs</span>, bg: true },
                      { label: 'Engine', render: (l: Listing) => <span className="text-sm">{l.engine}</span> },
                      { label: 'Propeller', render: (l: Listing) => <span className="text-sm">{l.prop}</span>, bg: true },
                      { label: 'Useful Load', render: (l: Listing) => { const hi = Math.max(...listings.map(c => c.usefulLoad)); const best = hi > 0 && l.usefulLoad === hi; return <span className={best ? 'text-emerald-600 font-bold' : ''}>{l.usefulLoad.toLocaleString()} lbs{best ? ' ★' : ''}</span>; } },
                      { label: 'Fuel', render: (l: Listing) => <span>{l.fuelCapacity} gal</span> },
                      { label: 'Exterior', render: (l: Listing) => <span>{l.exteriorRating}</span>, bg: true },
                      { label: 'Interior', render: (l: Listing) => <span>{l.interiorRating}</span> },
                      { label: 'Logs', render: (l: Listing) => l.logsComplete ? <span className="text-emerald-600 font-medium">✓ Complete</span> : <span className="text-red-500">Partial</span>, bg: true },
                      { label: 'Annual', render: (l: Listing) => l.annualCurrent ? <span className="text-emerald-600 font-medium">✓ Current</span> : <span className="text-red-500">Expired</span> },
                      { label: 'Damage', render: (l: Listing) => !l.damageHistory ? <span className="text-emerald-600 font-medium">✓ Clean</span> : <span className="text-yellow-600">Yes</span>, bg: true },
                      { label: 'Location', render: (l: Listing) => <span className="text-sm">{l.city}, {l.state}</span> },
                      { label: 'Avionics', render: (l: Listing) => <div className="flex flex-wrap gap-1 justify-center">{l.avionics.map((a, i) => <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">{a}</span>)}</div>, bg: true },
                    ].map((row) => (
                      <tr key={row.label} className={`border-b border-gray-100 ${row.bg ? 'bg-gray-50' : ''}`}>
                        <td className="p-4 text-sm font-semibold text-slate-700">{row.label}</td>
                        {listings.map((l) => <td key={l.id} className="p-4 text-center font-medium text-slate-900">{row.render(l)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">Not enough listings to compare.</div>
            )}

            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <button onClick={clearAll} className="text-slate-500 hover:text-slate-700 font-medium">Clear All</button>
              <button onClick={() => setShowModal(false)} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
