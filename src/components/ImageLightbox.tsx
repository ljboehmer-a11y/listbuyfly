'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  alt: string;
  initialIndex?: number;
  onClose: () => void;
}

export default function ImageLightbox({ images, alt, initialIndex = 0, onClose }: ImageLightboxProps) {
  const [current, setCurrent] = useState(initialIndex);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  // dragY drives the swipe-down-to-close visual: translates image + fades backdrop
  const [dragY, setDragY] = useState(0);
  const count = images.length;

  const prev = useCallback(() => {
    setCurrent((c) => (c === 0 ? count - 1 : c - 1));
  }, [count]);

  const next = useCallback(() => {
    setCurrent((c) => (c === count - 1 ? 0 : c + 1));
  }, [count]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [prev, next, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const dy = e.touches[0].clientY - touchStartY;
    // Only track downward pulls; upward swipes snap back
    if (dy > 0) setDragY(dy);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const dx = touchStartX - e.changedTouches[0].clientX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    if (dy > 80 && dy > Math.abs(dx)) {
      // Swipe down — dismiss
      onClose();
    } else if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe — navigate
      if (dx > 0) next();
      else prev();
    }

    setDragY(0);
    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Backdrop fades as user drags down; fully opaque at 0, mostly transparent at 200px
  const backdropOpacity = Math.max(0.15, 1 - dragY / 220);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: `rgba(0,0,0,${backdropOpacity})` }}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 z-10">
        <span className="text-white/80 text-sm font-medium">
          {current + 1} / {count}
        </span>
        <button
          onClick={onClose}
          className="bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Image — fills remaining space; translates down as user swipe-drags */}
      <div
        className="flex-1 min-h-0 flex items-center justify-center relative"
        style={{ transform: `translateY(${dragY}px)`, transition: dragY === 0 ? 'transform 0.2s ease' : 'none' }}
      >
        <img
          src={images[current]}
          alt={`${alt} - Photo ${current + 1}`}
          className="w-full h-full object-contain select-none pointer-events-none"
          draggable={false}
        />

        {/* Navigation arrows */}
        {count > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {count > 1 && (
        <div className="flex-shrink-0 flex justify-center gap-2 px-4 py-3 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all ${
                i === current ? 'border-amber-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
