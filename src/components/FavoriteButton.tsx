'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  listingId: string;
}

function getFavorites(): string[] {
  try {
    const match = document.cookie.match(/(^| )lbf_favorites=([^;]+)/);
    if (match) return JSON.parse(decodeURIComponent(match[2]));
  } catch {}
  return [];
}

function setFavorites(ids: string[]) {
  const expires = new Date(Date.now() + 90 * 864e5).toUTCString();
  document.cookie = `lbf_favorites=${encodeURIComponent(JSON.stringify(ids))}; expires=${expires}; path=/; SameSite=Lax`;
}

export default function FavoriteButton({ listingId }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const favs = getFavorites();
    setIsFavorited(favs.includes(listingId));
  }, [listingId]);

  const toggleFavorite = () => {
    const favs = getFavorites();
    let updated: string[];
    if (favs.includes(listingId)) {
      updated = favs.filter((id) => id !== listingId);
    } else {
      updated = [...favs, listingId];
    }
    setFavorites(updated);
    setIsFavorited(!isFavorited);
  };

  if (!mounted) {
    return (
      <button className="flex items-center gap-2 bg-white border border-gray-200 text-slate-700 px-4 py-2 rounded-full font-medium shadow-sm">
        <Heart className="w-5 h-5" />
        <span className="hidden sm:inline">Favorite</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleFavorite}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium shadow-sm transition-all ${
        isFavorited
          ? 'bg-amber-500 text-slate-900 border border-amber-500'
          : 'bg-white border border-gray-200 text-slate-700 hover:border-amber-400'
      }`}
    >
      <Heart className={`w-5 h-5 ${isFavorited ? 'fill-slate-900' : ''}`} />
      <span className="hidden sm:inline">{isFavorited ? 'Favorited' : 'Favorite'}</span>
    </button>
  );
}

// Export helper for other components to read favorites
export { getFavorites, setFavorites };
