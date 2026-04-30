'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, SlidersHorizontal, Heart, ChevronDown, ChevronUp, MapPin, ArrowUpDown, ArrowUp } from 'lucide-react';
import { Listing, Filters } from '@/lib/types';
import ImageCarousel from './ImageCarousel';
import { getListingImages } from '@/data/aircraftImages';
import { ALL_MAKES, getModelsForMake, getMakesForCategory, AIRCRAFT_CATEGORIES } from '@/data/aircraftTypes';
import { Show, UserButton, SignInButton } from '@clerk/nextjs';
import CompareButton from './CompareButton';

interface HomeContentProps {
  listings: Listing[];
}

const COLLECTIONS = [
  { id: 'all', label: 'All Aircraft' },
  { id: 'lowTime', label: 'Low Time Engines' },
  { id: 'budget', label: 'Under $80K' },
  { id: 'glass', label: 'Glass Cockpit' },
  { id: 'fresh', label: 'Fresh Annual' },
  { id: 'noDamage', label: 'No Damage History' },
  { id: 'featured', label: 'Featured' },
];

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const EMPTY_FILTERS: Filters = {
  categories: [],
  makes: [],
  models: [],
  states: [],
  maxPrice: undefined,
  minPrice: undefined,
  maxTTAF: undefined,
  maxSMOH: undefined,
  yearMin: undefined,
  yearMax: undefined,
  completeLogsOnly: false,
  currentAnnualOnly: false,
  noDamageOnly: false,
};

const DISTANCE_OPTIONS = [
  { value: 0, label: 'Any Distance' },
  { value: 25, label: '25 Miles' },
  { value: 50, label: '50 Miles' },
  { value: 75, label: '75 Miles' },
  { value: 100, label: '100 Miles' },
  { value: 150, label: '150 Miles' },
  { value: 250, label: '250 Miles' },
  { value: 500, label: '500 Miles' },
];

// Haversine distance between two lat/lng points in miles
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---- Multi-select dropdown component ----
function MultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = search
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  const toggle = (val: string) => {
    onChange(
      selected.includes(val) ? selected.filter((s) => s !== val) : [...selected, val]
    );
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-left text-sm bg-white hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 flex items-center justify-between"
      >
        <span className={selected.length ? 'text-slate-900' : 'text-gray-400'}>
          {selected.length ? `${selected.length} selected` : placeholder}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-hidden">
          {options.length > 8 && (
            <div className="p-2 border-b border-gray-100">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                autoFocus
              />
            </div>
          )}
          <div className="overflow-y-auto max-h-52">
            {filtered.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-amber-50 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => toggle(opt)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span className="text-slate-800">{opt}</span>
              </label>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-gray-400">No matches</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper: load SRP state from sessionStorage
function loadSrpState(): {
  searchQuery: string;
  activeCollection: string;
  showFilters: boolean;
  sortBy: string;
  filters: Filters;
  scrollY: number;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('lbf_srp_state');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export default function HomeContent({ listings }: HomeContentProps) {
  // Restore SRP state from sessionStorage (set when navigating to a listing)
  const savedState = useRef(loadSrpState());
  const hasRestoredScroll = useRef(false);

  const [searchQuery, setSearchQuery] = useState(savedState.current?.searchQuery || '');
  const [activeCollection, setActiveCollection] = useState(savedState.current?.activeCollection || 'all');
  const [showFilters, setShowFilters] = useState(savedState.current?.showFilters || false);
  const [compareList, setCompareList] = useState<string[]>(() => {
    // Initialize from cookie if available
    if (typeof document !== 'undefined') {
      try {
        const match = document.cookie.match(/(^| )lbf_favorites=([^;]+)/);
        if (match) return JSON.parse(decodeURIComponent(match[2]));
      } catch {}
    }
    return [];
  });
  const [showCompare, setShowCompare] = useState(false);
  const [sortBy, setSortBy] = useState(savedState.current?.sortBy || 'newest');
  const [filters, setFilters] = useState<Filters>(savedState.current?.filters || { ...EMPTY_FILTERS });
  const [zipCode, setZipCode] = useState('');
  const [zipDistance, setZipDistance] = useState(0);
  const [zipCoords, setZipCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [listingCoords, setListingCoords] = useState<Record<string, { lat: number; lng: number }>>({});
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [showMobileToolbar, setShowMobileToolbar] = useState(false);
  const listingGridRef = useRef<HTMLDivElement>(null);

  // Show mobile toolbar only after user scrolls past the listing grid top
  useEffect(() => {
    const el = listingGridRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowMobileToolbar(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Restore scroll position after listings render
  useEffect(() => {
    if (savedState.current?.scrollY && !hasRestoredScroll.current) {
      hasRestoredScroll.current = true;
      // Small delay to let the DOM render the listings before scrolling
      requestAnimationFrame(() => {
        window.scrollTo(0, savedState.current!.scrollY);
      });
    }
  }, []);

  // Geocode listing ZIP codes for proximity filtering
  useEffect(() => {
    const zipsToLookup = listings
      .filter((l) => l.zipCode && !listingCoords[l.id])
      .map((l) => ({ id: l.id, zip: l.zipCode }));
    // Deduplicate by zip
    const uniqueZips = [...new Set(zipsToLookup.map((z) => z.zip))];
    if (uniqueZips.length === 0) return;

    const lookup = async () => {
      const coordMap: Record<string, { lat: number; lng: number }> = {};
      for (const zip of uniqueZips) {
        try {
          const res = await fetch(`/api/geocode?zip=${zip}`);
          if (res.ok) {
            const data = await res.json();
            // Map all listings with this zip
            zipsToLookup.filter((z) => z.zip === zip).forEach((z) => {
              coordMap[z.id] = { lat: data.lat, lng: data.lng };
            });
          }
        } catch {}
      }
      if (Object.keys(coordMap).length > 0) {
        setListingCoords((prev) => ({ ...prev, ...coordMap }));
      }
    };
    lookup();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings]);

  // Handle ZIP search
  const handleZipSearch = async () => {
    if (!zipCode || !/^\d{5}$/.test(zipCode)) {
      setZipCoords(null);
      return;
    }
    try {
      const res = await fetch(`/api/geocode?zip=${zipCode}`);
      if (res.ok) {
        const data = await res.json();
        setZipCoords({ lat: data.lat, lng: data.lng });
      } else {
        setZipCoords(null);
      }
    } catch {
      setZipCoords(null);
    }
  };

  // Save SRP state to sessionStorage whenever filters/search/sort change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const state = {
      searchQuery,
      activeCollection,
      showFilters,
      sortBy,
      filters,
      scrollY: window.scrollY,
    };
    sessionStorage.setItem('lbf_srp_state', JSON.stringify(state));
  }, [searchQuery, activeCollection, showFilters, sortBy, filters]);

  // Count active filters
  const activeFilterCount = [
    filters.categories.length > 0,
    filters.makes.length > 0,
    filters.models.length > 0,
    filters.states.length > 0,
    filters.maxPrice !== undefined,
    filters.minPrice !== undefined,
    filters.maxTTAF !== undefined,
    filters.maxSMOH !== undefined,
    filters.yearMin !== undefined,
    filters.yearMax !== undefined,
    filters.completeLogsOnly,
    filters.currentAnnualOnly,
    filters.noDamageOnly,
  ].filter(Boolean).length;

  const filteredListings = useMemo(() => {
    let results = listings.filter((listing) => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchable = `${listing.year} ${listing.make} ${listing.model} ${listing.nNumber} ${listing.city} ${listing.state} ${listing.engine} ${listing.description}`.toLowerCase();
        if (!searchable.includes(query)) return false;
      }
      // Multi-select: OR within each filter, AND across filters
      if (filters.makes.length > 0 && !filters.makes.includes(listing.make)) return false;
      if (filters.models.length > 0) {
        const modelMatch = filters.models.some((m) =>
          listing.model.toLowerCase().includes(m.toLowerCase())
        );
        if (!modelMatch) return false;
      }
      if (filters.states.length > 0 && !filters.states.includes(listing.state)) return false;
      // Numeric ranges
      if (filters.minPrice !== undefined && listing.price < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && listing.price > filters.maxPrice) return false;
      // Exclude listings with no TTAF from maxTTAF filter — "not listed" shouldn't
      // appear in results when a buyer is specifically filtering by hours
      if (filters.maxTTAF !== undefined && (listing.ttaf === 0 || listing.ttaf > filters.maxTTAF)) return false;
      if (filters.maxSMOH !== undefined && listing.smoh > filters.maxSMOH) return false;
      if (filters.yearMin !== undefined && listing.year < filters.yearMin) return false;
      if (filters.yearMax !== undefined && listing.year > filters.yearMax) return false;
      // Booleans
      if (filters.completeLogsOnly && !listing.logsComplete) return false;
      if (filters.currentAnnualOnly && !listing.annualCurrent) return false;
      if (filters.noDamageOnly && listing.damageHistory) return false;
      return true;
    });

    // Collections
    if (activeCollection !== 'all') {
      results = results.filter((listing) => {
        if (activeCollection === 'lowTime') return listing.smoh < 500;
        if (activeCollection === 'budget') return listing.price < 80000;
        if (activeCollection === 'glass') {
          return listing.avionics.some((a) =>
            a.toLowerCase().includes('glass') || a.toLowerCase().includes('g1000') || a.toLowerCase().includes('g3x') || a.toLowerCase().includes('perspective')
          );
        }
        if (activeCollection === 'fresh') {
          const now = new Date();
          const annualDate = new Date(listing.annualDate);
          const daysOld = (now.getTime() - annualDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysOld < 90;
        }
        if (activeCollection === 'noDamage') return !listing.damageHistory;
        if (activeCollection === 'featured') return listing.featured;
        return true;
      });
    }

    // ZIP proximity filter
    if (zipCoords && zipDistance > 0) {
      results = results.filter((listing) => {
        const coords = listingCoords[listing.id];
        if (!coords) return false; // No coords = can't determine distance, exclude
        return haversineDistance(zipCoords.lat, zipCoords.lng, coords.lat, coords.lng) <= zipDistance;
      });
    }

    // Sort
    if (sortBy === 'newest') {
      results.sort((a, b) => new Date(b.listedDate).getTime() - new Date(a.listedDate).getTime());
    } else if (sortBy === 'priceAsc') {
      // Listings without a price (Call/Email) sort to the end
      results.sort((a, b) => {
        const ap = a.price && a.price > 0 ? a.price : Infinity;
        const bp = b.price && b.price > 0 ? b.price : Infinity;
        return ap - bp;
      });
    } else if (sortBy === 'priceDesc') {
      // Listings without a price (Call/Email) sort to the end
      results.sort((a, b) => {
        const ap = a.price && a.price > 0 ? a.price : -1;
        const bp = b.price && b.price > 0 ? b.price : -1;
        return bp - ap;
      });
    } else if (sortBy === 'lowSmoh') {
      results.sort((a, b) => a.smoh - b.smoh);
    } else if (sortBy === 'lowTtaf') {
      // Push "not listed" (ttaf === 0) to the bottom so real low-hour planes lead
      results.sort((a, b) => {
        if (a.ttaf === 0 && b.ttaf === 0) return 0;
        if (a.ttaf === 0) return 1;
        if (b.ttaf === 0) return -1;
        return a.ttaf - b.ttaf;
      });
    } else if (sortBy === 'yearDesc') {
      results.sort((a, b) => b.year - a.year);
    }

    return results;
  }, [listings, searchQuery, filters, activeCollection, sortBy, zipCoords, zipDistance, listingCoords]);

  const toggleCompare = (id: string) => {
    setCompareList((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : prev.length < 4 ? [...prev, id] : prev;
      // Sync to cookie so ADP favorite button stays in sync
      const expires = new Date(Date.now() + 90 * 864e5).toUTCString();
      document.cookie = `lbf_favorites=${encodeURIComponent(JSON.stringify(updated))}; expires=${expires}; path=/; SameSite=Lax`;
      return updated;
    });
  };

  const compareListings = listings.filter((l) => compareList.includes(l.id));

  // Cascading options: Type → Make → Model
  const listingMakes = Array.from(new Set(listings.map((l) => l.make)));
  const makes = filters.categories.length > 0
    ? Array.from(new Set([
        ...filters.categories.flatMap((c) => getMakesForCategory(c)),
        ...listingMakes,
      ])).sort()
    : Array.from(new Set([...ALL_MAKES, ...listingMakes])).sort();

  const models = filters.makes.length > 0
    ? Array.from(new Set(
        filters.makes.flatMap((mk) => [
          ...getModelsForMake(mk, filters.categories.length === 1 ? filters.categories[0] : undefined),
          ...listings.filter((l) => l.make === mk).map((l) => l.model),
        ])
      )).sort()
    : [];

  // Applied filter tags
  const appliedTags: { label: string; onRemove: () => void }[] = [];
  filters.categories.forEach((c) =>
    appliedTags.push({ label: c, onRemove: () => setFilters((p) => ({ ...p, categories: p.categories.filter((x) => x !== c) })) })
  );
  filters.makes.forEach((m) =>
    appliedTags.push({ label: m, onRemove: () => setFilters((p) => ({ ...p, makes: p.makes.filter((x) => x !== m), models: [] })) })
  );
  filters.models.forEach((m) =>
    appliedTags.push({ label: m, onRemove: () => setFilters((p) => ({ ...p, models: p.models.filter((x) => x !== m) })) })
  );
  filters.states.forEach((s) =>
    appliedTags.push({ label: s, onRemove: () => setFilters((p) => ({ ...p, states: p.states.filter((x) => x !== s) })) })
  );
  if (filters.minPrice !== undefined) appliedTags.push({ label: `Min $${filters.minPrice.toLocaleString()}`, onRemove: () => setFilters((p) => ({ ...p, minPrice: undefined })) });
  if (filters.maxPrice !== undefined) appliedTags.push({ label: `Max $${filters.maxPrice.toLocaleString()}`, onRemove: () => setFilters((p) => ({ ...p, maxPrice: undefined })) });
  if (filters.yearMin !== undefined) appliedTags.push({ label: `${filters.yearMin}+`, onRemove: () => setFilters((p) => ({ ...p, yearMin: undefined })) });
  if (filters.yearMax !== undefined) appliedTags.push({ label: `Pre-${filters.yearMax}`, onRemove: () => setFilters((p) => ({ ...p, yearMax: undefined })) });
  if (filters.maxTTAF !== undefined) appliedTags.push({ label: `TTAF ≤${filters.maxTTAF.toLocaleString()}`, onRemove: () => setFilters((p) => ({ ...p, maxTTAF: undefined })) });
  if (filters.maxSMOH !== undefined) appliedTags.push({ label: `SMOH ≤${filters.maxSMOH.toLocaleString()}`, onRemove: () => setFilters((p) => ({ ...p, maxSMOH: undefined })) });
  if (filters.completeLogsOnly) appliedTags.push({ label: 'Complete Logs', onRemove: () => setFilters((p) => ({ ...p, completeLogsOnly: false })) });
  if (filters.currentAnnualOnly) appliedTags.push({ label: 'Current Annual', onRemove: () => setFilters((p) => ({ ...p, currentAnnualOnly: false })) });
  if (filters.noDamageOnly) appliedTags.push({ label: 'No Damage', onRemove: () => setFilters((p) => ({ ...p, noDamageOnly: false })) });

  return (
    <>
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 sm:gap-3 no-underline text-white hover:opacity-90 transition-opacity shrink-0">
            <div className="bg-amber-500 rounded-lg p-1.5 sm:p-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold leading-tight">List Buy Fly</h1>
              <p className="text-[10px] sm:text-xs text-slate-400 tracking-widest uppercase hidden sm:block">Aircraft Marketplace</p>
            </div>
          </a>
          <nav className="flex items-center gap-1.5 sm:gap-3">
            <a href="/guides" className="hidden sm:flex items-center gap-2 text-slate-300 hover:text-white px-3 py-2 transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 3 9.753 3 15.5m0 0h18m-18 0c0 5.747 3.5 9.247 9 9.247m9-9.247c0 5.747-3.5 9.247-9 9.247" /></svg>
              Guides
            </a>
            <CompareButton />
            <Show when="signed-in">
              <a href="/dashboard" className="hidden sm:flex items-center gap-2 text-slate-300 hover:text-white px-3 py-2 transition-colors text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" /></svg>
                Dashboard
              </a>
              <a href="/dashboard" className="sm:hidden text-slate-300 hover:text-white p-2 transition-colors" title="Dashboard">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" /></svg>
              </a>
              <a href="/create" className="bg-amber-500 text-slate-900 px-3 sm:px-5 py-2 rounded-lg font-semibold hover:bg-amber-600 transition-colors flex items-center gap-1 sm:gap-2 text-sm">
                <span>+</span><span className="hidden sm:inline">List Aircraft</span><span className="sm:hidden">List</span>
              </a>
              <UserButton />
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="text-slate-300 hover:text-white px-2 sm:px-4 py-2 transition-colors font-medium text-sm">
                  Sign In
                </button>
              </SignInButton>
              <a href="/create" className="bg-amber-500 text-slate-900 px-3 sm:px-5 py-2 rounded-lg font-semibold hover:bg-amber-600 transition-colors flex items-center gap-1 sm:gap-2 text-sm">
                <span>+</span><span className="hidden sm:inline">List Aircraft</span><span className="sm:hidden">List</span>
              </a>
            </Show>
          </nav>
        </div>
      </header>

      {/* Mobile Floating Toolbar — appears when user scrolls past listings */}
      <div
        className={`sm:hidden fixed top-16 left-4 right-4 z-40 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 transition-all duration-300 ${
          showMobileToolbar ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setMobileSortOpen(true)}
              className="flex flex-col items-center px-3 py-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4 text-slate-700" />
              <span className="text-[10px] font-medium text-slate-700">sort</span>
            </button>
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex flex-col items-center px-3 py-1 rounded-full hover:bg-slate-100 transition-colors relative"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-700" />
              <span className="text-[10px] font-medium text-slate-700">filter</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-900 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="flex flex-col items-center px-3 py-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <Search className="w-4 h-4 text-slate-700" />
              <span className="text-[10px] font-medium text-slate-700">find</span>
            </button>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex flex-col items-center px-3 py-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowUp className="w-4 h-4 text-slate-700" />
            <span className="text-[10px] font-medium text-slate-700">to top</span>
          </button>
        </div>
      </div>

      {/* Mobile Sort Modal */}
      {mobileSortOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:hidden" onClick={() => setMobileSortOpen(false)}>
          <div className="bg-white rounded-t-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Sort by...</h3>
              <button onClick={() => setMobileSortOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
            </div>
            <div className="pb-8">
              {[
                { value: 'newest', label: 'Newest Listed' },
                { value: 'priceDesc', label: 'Highest Price' },
                { value: 'priceAsc', label: 'Lowest Price' },
                { value: 'yearDesc', label: 'Newest Year' },
                { value: 'lowTtaf', label: 'Lowest TTAF' },
                { value: 'lowSmoh', label: 'Lowest SMOH' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSortBy(opt.value); setMobileSortOpen(false); }}
                  className={`w-full text-left px-6 py-4 text-base transition-colors ${
                    sortBy === opt.value
                      ? 'bg-slate-100 font-semibold text-slate-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center justify-between">
                    {opt.label}
                    {sortBy === opt.value && <span className="text-amber-500 text-lg">✓</span>}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Search Modal */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-12 sm:hidden" onClick={() => setMobileSearchOpen(false)}>
          <div className="bg-white rounded-2xl w-[90%] max-h-[80vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search all inventory..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
                  />
                </div>
                <button
                  onClick={() => setMobileSearchOpen(false)}
                  className="px-4 py-3 bg-amber-500 text-slate-900 rounded-lg font-bold hover:bg-amber-600 transition-colors"
                >
                  GO
                </button>
              </div>

              {/* Collection pills in search modal */}
              <div className="flex flex-wrap gap-2 mb-4">
                {COLLECTIONS.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => { setActiveCollection(activeCollection === collection.id && collection.id !== 'all' ? 'all' : collection.id); }}
                    className={`px-3 py-1.5 rounded-full font-medium transition-colors text-xs ${
                      activeCollection === collection.id
                        ? 'bg-amber-500 text-slate-900'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {collection.label}
                  </button>
                ))}
              </div>

              {/* Quick results preview */}
              {searchQuery.trim() && (
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs text-slate-500 mb-2">{filteredListings.length} results</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {filteredListings.slice(0, 8).map((l) => (
                      <a
                        key={l.id}
                        href={`/listing/${l.id}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 no-underline"
                      >
                        <div className="w-16 h-12 rounded overflow-hidden flex-shrink-0 bg-slate-100">
                          <img
                            src={l.images && l.images.length > 0 ? l.images[0] : getListingImages(l.id, l.make)[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{l.year} {l.make} {l.model}</p>
                          <p className="text-sm text-slate-500">{l.price && l.price > 0 ? `$${l.price.toLocaleString()}` : 'Call/Email'}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:hidden" onClick={() => setMobileFilterOpen(false)}>
          <div className="bg-white rounded-t-2xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 flex items-center justify-between px-6 pt-5 pb-3 z-10">
              <h3 className="text-lg font-bold text-slate-900">Filters</h3>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => { setFilters({ ...EMPTY_FILTERS }); setSearchQuery(''); }}
                    className="text-sm text-red-500 font-semibold"
                  >
                    Clear all
                  </button>
                )}
                <button onClick={() => setMobileFilterOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
              </div>
            </div>
            <div className="px-6 py-4 space-y-5 pb-8">
              {/* Applied tags */}
              {appliedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {appliedTags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-sm font-medium">
                      {tag.label}
                      <button onClick={tag.onRemove}><X className="w-3.5 h-3.5" /></button>
                    </span>
                  ))}
                </div>
              )}

              <MultiSelect label="Type" options={AIRCRAFT_CATEGORIES} selected={filters.categories} onChange={(val) => setFilters((p) => ({ ...p, categories: val, makes: [], models: [] }))} placeholder="All Types" />
              <MultiSelect label="Make" options={makes} selected={filters.makes} onChange={(val) => setFilters((p) => ({ ...p, makes: val, models: [] }))} placeholder="All Makes" />
              <MultiSelect label="Model" options={models} selected={filters.models} onChange={(val) => setFilters((p) => ({ ...p, models: val }))} placeholder={filters.makes.length ? 'All Models' : 'Select make first'} />
              <MultiSelect label="State" options={STATES} selected={filters.states} onChange={(val) => setFilters((p) => ({ ...p, states: val }))} placeholder="All States" />

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Price Range</label>
                <div className="flex gap-2">
                  <input type="number" value={filters.minPrice ?? ''} onChange={(e) => setFilters((p) => ({ ...p, minPrice: e.target.value ? parseInt(e.target.value) : undefined }))} placeholder="Min" className="w-1/2 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  <input type="number" value={filters.maxPrice ?? ''} onChange={(e) => setFilters((p) => ({ ...p, maxPrice: e.target.value ? parseInt(e.target.value) : undefined }))} placeholder="Max" className="w-1/2 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Year Range</label>
                <div className="flex gap-2">
                  <input type="number" value={filters.yearMin ?? ''} onChange={(e) => setFilters((p) => ({ ...p, yearMin: e.target.value ? parseInt(e.target.value) : undefined }))} placeholder="From" className="w-1/2 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  <input type="number" value={filters.yearMax ?? ''} onChange={(e) => setFilters((p) => ({ ...p, yearMax: e.target.value ? parseInt(e.target.value) : undefined }))} placeholder="To" className="w-1/2 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Max TTAF</label>
                <input type="number" value={filters.maxTTAF ?? ''} onChange={(e) => setFilters((p) => ({ ...p, maxTTAF: e.target.value ? parseInt(e.target.value) : undefined }))} placeholder="e.g. 5000" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Max SMOH</label>
                <input type="number" value={filters.maxSMOH ?? ''} onChange={(e) => setFilters((p) => ({ ...p, maxSMOH: e.target.value ? parseInt(e.target.value) : undefined }))} placeholder="e.g. 1000" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>

              {/* ZIP Proximity */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Distance From ZIP</label>
                <div className="flex gap-2">
                  <select value={zipDistance} onChange={(e) => { setZipDistance(Number(e.target.value)); if (Number(e.target.value) > 0 && zipCode.length === 5) handleZipSearch(); }} className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                    {DISTANCE_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                  </select>
                  <input type="text" inputMode="numeric" maxLength={5} placeholder="ZIP" value={zipCode} onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))} className="w-24 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  <button onClick={handleZipSearch} className="px-3 py-2.5 bg-amber-500 text-slate-900 rounded-lg font-bold text-sm">Go</button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={filters.completeLogsOnly} onChange={(e) => setFilters((p) => ({ ...p, completeLogsOnly: e.target.checked }))} className="w-5 h-5 accent-amber-500 rounded" />
                  <span className="text-sm font-medium text-slate-700">Complete Logs Only</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={filters.currentAnnualOnly} onChange={(e) => setFilters((p) => ({ ...p, currentAnnualOnly: e.target.checked }))} className="w-5 h-5 accent-amber-500 rounded" />
                  <span className="text-sm font-medium text-slate-700">Current Annual Only</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={filters.noDamageOnly} onChange={(e) => setFilters((p) => ({ ...p, noDamageOnly: e.target.checked }))} className="w-5 h-5 accent-amber-500 rounded" />
                  <span className="text-sm font-medium text-slate-700">No Damage History</span>
                </label>
              </div>

              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-amber-500 text-slate-900 font-bold py-3 rounded-lg hover:bg-amber-600 transition-colors mt-2"
              >
                Show {filteredListings.length} Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-8 sm:py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6 text-white">List it. Buy it. Fly it.</h2>
          <p className="text-sm sm:text-base text-slate-400 mb-6 sm:mb-8 max-w-2xl">
            The aircraft marketplace built by pilots, for pilots. Better filtering, transparent data, side-by-side comparison.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mb-6 sm:mb-8">
            <form className="flex gap-2 mb-2 sm:mb-0" onSubmit={(e) => e.preventDefault()}>
              <div className="flex-1 relative bg-white rounded-lg">
                <Search className="absolute left-3 sm:left-4 top-3 sm:top-4 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search all inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 text-sm sm:text-base"
                />
              </div>
              <button type="submit" className="px-4 sm:px-8 py-3 sm:py-4 bg-amber-500 text-slate-900 rounded-lg font-bold hover:bg-amber-600 transition-colors text-sm sm:text-base">
                GO
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 sm:px-6 py-3 sm:py-4 rounded-lg font-bold transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base ${
                  showFilters ? 'bg-white text-slate-900' : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-amber-500 text-slate-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </form>
          </div>

          {/* Collection Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap mb-4">
            {COLLECTIONS.map((collection) => (
              <button
                key={collection.id}
                onClick={() => setActiveCollection(activeCollection === collection.id && collection.id !== 'all' ? 'all' : collection.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium transition-colors text-xs sm:text-sm whitespace-nowrap ${
                  activeCollection === collection.id
                    ? 'bg-amber-500 text-slate-900'
                    : 'bg-slate-800 border border-slate-600 text-slate-300 hover:border-amber-500'
                }`}
              >
                {collection.label}
              </button>
            ))}
          </div>

          {/* ZIP Proximity Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <select
                value={zipDistance}
                onChange={(e) => { setZipDistance(Number(e.target.value)); if (Number(e.target.value) > 0 && zipCode.length === 5) handleZipSearch(); }}
                className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {DISTANCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <span className="text-slate-400 text-sm">of</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="ZIP Code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
                className="w-24 px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={handleZipSearch}
                className="px-4 py-2 bg-amber-500 text-slate-900 rounded-lg font-bold hover:bg-amber-600 transition-colors text-sm"
              >
                Update
              </button>
            </div>
            {zipCoords && zipDistance > 0 && (
              <button
                onClick={() => { setZipDistance(0); setZipCoords(null); setZipCode(''); }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" /> Clear location
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-slate-50 border-b border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-4">
            {/* Applied Filter Tags */}
            {appliedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider self-center mr-1">Applied:</span>
                {appliedTags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-sm font-medium">
                    {tag.label}
                    <button onClick={tag.onRemove} className="hover:text-amber-600 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => {
                    setFilters({ ...EMPTY_FILTERS });
                    setSearchQuery('');
                  }}
                  className="text-xs text-red-500 hover:text-red-600 font-semibold self-center ml-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Filter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <MultiSelect
                label="Type"
                options={AIRCRAFT_CATEGORIES}
                selected={filters.categories}
                onChange={(val) => setFilters((p) => ({ ...p, categories: val, makes: [], models: [] }))}
                placeholder="All Types"
              />
              <MultiSelect
                label="Make"
                options={makes}
                selected={filters.makes}
                onChange={(val) => setFilters((p) => ({ ...p, makes: val, models: [] }))}
                placeholder="All Makes"
              />
              <MultiSelect
                label="Model"
                options={models}
                selected={filters.models}
                onChange={(val) => setFilters((p) => ({ ...p, models: val }))}
                placeholder={filters.makes.length ? 'All Models' : 'Select make first'}
              />
              <MultiSelect
                label="State"
                options={STATES}
                selected={filters.states}
                onChange={(val) => setFilters((p) => ({ ...p, states: val }))}
                placeholder="All States"
              />
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Price Range</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={filters.minPrice ?? ''}
                    onChange={(e) => setFilters((p) => ({ ...p, minPrice: e.target.value ? parseInt(e.target.value) : undefined }))}
                    placeholder="Min"
                    className="w-1/2 px-2 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice ?? ''}
                    onChange={(e) => setFilters((p) => ({ ...p, maxPrice: e.target.value ? parseInt(e.target.value) : undefined }))}
                    placeholder="Max"
                    className="w-1/2 px-2 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Year Range</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={filters.yearMin ?? ''}
                    onChange={(e) => setFilters((p) => ({ ...p, yearMin: e.target.value ? parseInt(e.target.value) : undefined }))}
                    placeholder="From"
                    className="w-1/2 px-2 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <input
                    type="number"
                    value={filters.yearMax ?? ''}
                    onChange={(e) => setFilters((p) => ({ ...p, yearMax: e.target.value ? parseInt(e.target.value) : undefined }))}
                    placeholder="To"
                    className="w-1/2 px-2 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Second row: numeric + toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Max TTAF</label>
                <input
                  type="number"
                  value={filters.maxTTAF ?? ''}
                  onChange={(e) => setFilters((p) => ({ ...p, maxTTAF: e.target.value ? parseInt(e.target.value) : undefined }))}
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Max SMOH</label>
                <input
                  type="number"
                  value={filters.maxSMOH ?? ''}
                  onChange={(e) => setFilters((p) => ({ ...p, maxSMOH: e.target.value ? parseInt(e.target.value) : undefined }))}
                  placeholder="e.g. 1000"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer self-end pb-1">
                <input type="checkbox" checked={filters.completeLogsOnly} onChange={(e) => setFilters((p) => ({ ...p, completeLogsOnly: e.target.checked }))} className="w-4 h-4 accent-amber-500 rounded" />
                <span className="text-sm font-medium text-slate-700">Complete Logs</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer self-end pb-1">
                <input type="checkbox" checked={filters.currentAnnualOnly} onChange={(e) => setFilters((p) => ({ ...p, currentAnnualOnly: e.target.checked }))} className="w-4 h-4 accent-amber-500 rounded" />
                <span className="text-sm font-medium text-slate-700">Current Annual</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer self-end pb-1">
                <input type="checkbox" checked={filters.noDamageOnly} onChange={(e) => setFilters((p) => ({ ...p, noDamageOnly: e.target.checked }))} className="w-4 h-4 accent-amber-500 rounded" />
                <span className="text-sm font-medium text-slate-700">No Damage</span>
              </label>
              <div className="self-end">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="newest">Newest Listed</option>
                  <option value="priceAsc">Price: Low → High</option>
                  <option value="priceDesc">Price: High → Low</option>
                  <option value="lowSmoh">Lowest SMOH</option>
                  <option value="lowTtaf">Lowest TTAF</option>
                  <option value="yearDesc">Newest Year</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div ref={listingGridRef} className="mb-6 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900">
            {filteredListings.length} aircraft available
          </h3>
        </div>

        {/* Listing Grid */}
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-20">
            {filteredListings.map((listing, index) => {
              const isCompared = compareList.includes(listing.id);

              return (
                <Link
                  key={listing.id}
                  href={`/listing/${listing.id}`}
                  prefetch={index < 6}
                  onClick={() => {
                    // Snapshot scroll position right before navigating to listing
                    const state = {
                      searchQuery,
                      activeCollection,
                      showFilters,
                      sortBy,
                      filters,
                      scrollY: window.scrollY,
                    };
                    sessionStorage.setItem('lbf_srp_state', JSON.stringify(state));
                  }}
                  className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative flex flex-col no-underline ${
                    isCompared ? 'ring-2 ring-amber-500' : ''
                  }`}
                >
                  <div className="aspect-[4/3] relative group flex-shrink-0 overflow-hidden bg-slate-100">
                    <ImageCarousel images={listing.images && listing.images.length > 0 ? listing.images : getListingImages(listing.id, listing.make)} alt={`${listing.year} ${listing.make} ${listing.model}`} variant="card" />
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(listing.id); }}
                      className={`absolute top-2 right-2 p-2 rounded-lg shadow-md transition-all ${
                        isCompared
                          ? 'bg-amber-500 opacity-100'
                          : 'bg-white opacity-0 group-hover:opacity-100'
                      }`}
                      title={isCompared ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart className={`w-5 h-5 ${isCompared ? 'text-white fill-white' : 'text-slate-600'}`} />
                    </button>
                    {listing.featured && (
                      <div className="absolute top-2 left-2 bg-amber-500 text-slate-900 px-2 py-1 rounded text-xs font-bold">FEATURED</div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-1 min-h-[3rem]">
                      {listing.year} {listing.make} {listing.model}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{listing.nNumber}</p>
                    <div className="mb-4">
                      <p className="text-xl sm:text-2xl font-bold text-amber-500">
                        {listing.price && listing.price > 0
                          ? `$${listing.price.toLocaleString()}`
                          : 'Call/Email for Price'}
                      </p>
                    </div>
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600">TTAF:</span><span className="font-semibold text-slate-900">{listing.ttaf > 0 ? listing.ttaf.toLocaleString() : 'Not listed'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">SMOH:</span><span className="font-semibold text-slate-900">{listing.smoh.toLocaleString()}</span></div>
                    </div>
                    {listing.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{listing.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {listing.logsComplete && <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-medium">✓ Logs</span>}
                      {listing.annualCurrent && <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-medium">✓ Annual</span>}
                      {!listing.damageHistory && <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-medium">✓ Clean</span>}
                    </div>
                    <div className="mt-auto">
                      <div className="border-t border-gray-200 pt-3 flex justify-between text-xs text-gray-600">
                        <span>{listing.city}, {listing.state}</span>
                        <span>{listing.engine}</span>
                      </div>
                      <span className="block text-center mt-3 bg-slate-900 text-white py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors">View Details</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No aircraft match your filters.</p>
            <button onClick={() => { setSearchQuery(''); setFilters({ ...EMPTY_FILTERS }); }} className="mt-4 text-amber-500 hover:text-amber-600 font-medium">
              Clear Filters
            </button>
          </div>
        )}

        {/* Compare Bar */}
        {compareList.length > 0 && !showCompare && (
          <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t-2 border-amber-500 text-white p-3 sm:p-4 z-50">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm sm:text-base">{compareList.length} selected</span>
                <span className="text-slate-400 text-xs">(max 4)</span>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button onClick={() => setShowCompare(true)} disabled={compareList.length < 2} className="bg-amber-500 text-slate-900 px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                  Compare {compareList.length >= 2 ? `(${compareList.length})` : ''}
                </button>
                <button onClick={() => { setCompareList([]); document.cookie = `lbf_favorites=${encodeURIComponent('[]')}; expires=${new Date(Date.now() + 90 * 864e5).toUTCString()}; path=/; SameSite=Lax`; }} className="bg-slate-700 hover:bg-slate-600 px-4 sm:px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1 text-sm">
                  <X className="w-4 h-4" /> Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Compare Modal */}
      {showCompare && compareListings.length >= 2 && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center overflow-y-auto py-8" onClick={() => setShowCompare(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-900 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
              <h2 className="text-xl font-bold">Side-by-Side Comparison</h2>
              <button onClick={() => setShowCompare(false)} className="text-slate-400 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-32" />
                  {compareListings.map((l) => (
                    <col key={l.id} />
                  ))}
                </colgroup>
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="p-4 text-left text-sm font-medium text-slate-500">Spec</th>
                    {compareListings.map((l) => (
                      <th key={l.id} className="p-4 text-center">
                        <div className="aspect-[4/3] rounded-lg mb-3 overflow-hidden"><img src={l.images && l.images.length > 0 ? l.images[0] : getListingImages(l.id, l.make)[0]} alt={`${l.year} ${l.make} ${l.model}`} className="w-full h-full object-cover" /></div>
                        <a href={`/listing/${l.id}`} className="text-slate-900 font-bold hover:text-amber-500 transition-colors">{l.year} {l.make} {l.model}</a>
                        <p className="text-xs text-gray-500 mt-1">{l.nNumber}</p>
                        <button onClick={() => toggleCompare(l.id)} className="text-xs text-red-500 hover:text-red-600 mt-2">Remove</button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Price', render: (l: Listing) => <span className="text-xl font-bold text-amber-500">{l.price && l.price > 0 ? `$${l.price.toLocaleString()}` : 'Call/Email for Price'}</span>, bg: true },
                    { label: 'Year', render: (l: Listing) => <span>{l.year}</span> },
                    { label: 'TTAF', render: (l: Listing) => { const low = Math.min(...compareListings.map(c => c.ttaf)); return <span className={l.ttaf === low ? 'text-emerald-600 font-bold' : ''}>{l.ttaf.toLocaleString()} hrs{l.ttaf === low ? ' ★' : ''}</span>; }, bg: true },
                    { label: 'SMOH', render: (l: Listing) => { const low = Math.min(...compareListings.map(c => c.smoh)); return <span className={l.smoh === low ? 'text-emerald-600 font-bold' : ''}>{l.smoh.toLocaleString()} hrs{l.smoh === low ? ' ★' : ''}</span>; } },
                    { label: 'TBO', render: (l: Listing) => <span>{l.tbo.toLocaleString()} hrs</span>, bg: true },
                    { label: 'Engine', render: (l: Listing) => <span className="text-sm">{l.engine}</span> },
                    { label: 'Propeller', render: (l: Listing) => <span className="text-sm">{l.prop}</span>, bg: true },
                    { label: 'Useful Load', render: (l: Listing) => { const hi = Math.max(...compareListings.map(c => c.usefulLoad)); const best = hi > 0 && l.usefulLoad === hi; return <span className={best ? 'text-emerald-600 font-bold' : ''}>{l.usefulLoad.toLocaleString()} lbs{best ? ' ★' : ''}</span>; } },
                    { label: 'Fuel', render: (l: Listing) => <span>{l.fuelCapacity} gal</span>, bg: true },
                    { label: 'Exterior', render: (l: Listing) => <span>{l.exteriorRating}</span> },
                    { label: 'Interior', render: (l: Listing) => <span>{l.interiorRating}</span>, bg: true },
                    { label: 'Logs', render: (l: Listing) => l.logsComplete ? <span className="text-emerald-600 font-medium">✓ Complete</span> : <span className="text-red-500">Partial</span> },
                    { label: 'Annual', render: (l: Listing) => l.annualCurrent ? <span className="text-emerald-600 font-medium">✓ Current</span> : <span className="text-red-500">Expired</span>, bg: true },
                    { label: 'Damage', render: (l: Listing) => !l.damageHistory ? <span className="text-emerald-600 font-medium">✓ Clean</span> : <span className="text-yellow-600">Yes</span> },
                    { label: 'Location', render: (l: Listing) => <span className="text-sm">{l.city}, {l.state}</span>, bg: true },
                    { label: 'Avionics', render: (l: Listing) => <div className="flex flex-wrap gap-1 justify-center">{l.avionics.map((a, i) => <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">{a}</span>)}</div> },
                  ].map((row) => (
                    <tr key={row.label} className={`border-b border-gray-100 ${row.bg ? 'bg-gray-50' : ''}`}>
                      <td className="p-4 text-sm font-semibold text-slate-700">{row.label}</td>
                      {compareListings.map((l) => <td key={l.id} className="p-4 text-center font-medium text-slate-900">{row.render(l)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <button onClick={() => { setCompareList([]); setShowCompare(false); document.cookie = `lbf_favorites=${encodeURIComponent('[]')}; expires=${new Date(Date.now() + 90 * 864e5).toUTCString()}; path=/; SameSite=Lax`; }} className="text-slate-500 hover:text-slate-700 font-medium">Clear All</button>
              <button onClick={() => setShowCompare(false)} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors">Back to Listings</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
