'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  /** 'card' = SRP thumbnail, 'detail' = ADP full gallery */
  variant?: 'card' | 'detail';
}

export default function ImageCarousel({ images, alt, variant = 'card' }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  // Refs hold touch state so the non-passive listener can read them without stale closures
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  // null = undecided, true = horizontal, false = vertical
  const directionRef = useRef<boolean | null>(null);

  const count = images.length;

  const prev = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrent((c) => (c === 0 ? count - 1 : c - 1));
  }, [count]);

  const next = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrent((c) => (c === count - 1 ? 0 : c + 1));
  }, [count]);

  // Non-passive touch handlers so we can preventDefault on horizontal swipes,
  // which stops the page from scrolling while the user navigates photos.
  // React attaches touch listeners as passive by default (can't preventDefault there),
  // so we add them manually via a ref.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || count <= 1) return;

    const onTouchStart = (e: TouchEvent) => {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      directionRef.current = null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;

      // Lock direction once movement exceeds 5px threshold
      if (directionRef.current === null) {
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
          directionRef.current = Math.abs(dx) >= Math.abs(dy);
        }
      }

      // Only block native scroll when we've confirmed a horizontal gesture
      if (directionRef.current === true) {
        e.preventDefault();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || directionRef.current !== true) {
        touchStartRef.current = null;
        directionRef.current = null;
        return;
      }
      const dx = touchStartRef.current.x - e.changedTouches[0].clientX;
      if (dx > 40) setCurrent((c) => (c === count - 1 ? 0 : c + 1));
      else if (dx < -40) setCurrent((c) => (c === 0 ? count - 1 : c - 1));
      touchStartRef.current = null;
      directionRef.current = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [count]);

  if (count === 0) {
    return (
      <div className={`bg-gradient-to-b from-slate-200 to-slate-100 flex items-center justify-center ${variant === 'detail' ? 'aspect-[3/2] w-full rounded-lg' : 'h-full'}`}>
        <span className="text-slate-400 text-sm">No photos</span>
      </div>
    );
  }

  const isDetail = variant === 'detail';

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden group ${isDetail ? 'aspect-[3/2] w-full rounded-lg' : 'h-full'}`}
    >
      {/* Images */}
      <div
        className="flex transition-transform duration-300 ease-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((src, i) => (
          <div key={i} className="w-full h-full flex-shrink-0 bg-slate-100">
            <img
              src={src}
              alt={`${alt} - Photo ${i + 1}`}
              className="w-full h-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        ))}
      </div>

      {/* Navigation arrows — always visible on card, full-opacity on detail */}
      {count > 1 && (
        <>
          <button
            onClick={prev}
            className={`absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors ${
              isDetail ? 'w-10 h-10' : 'w-8 h-8'
            }`}
            aria-label="Previous photo"
          >
            <ChevronLeft className={isDetail ? 'w-6 h-6' : 'w-5 h-5'} />
          </button>
          <button
            onClick={next}
            className={`absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors ${
              isDetail ? 'w-10 h-10' : 'w-8 h-8'
            }`}
            aria-label="Next photo"
          >
            <ChevronRight className={isDetail ? 'w-6 h-6' : 'w-5 h-5'} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {count > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); }}
              className={`rounded-full transition-all ${
                i === current
                  ? `bg-white ${isDetail ? 'w-3 h-3' : 'w-2.5 h-2.5'}`
                  : `bg-white/50 hover:bg-white/75 ${isDetail ? 'w-2.5 h-2.5' : 'w-2 h-2'}`
              }`}
            />
          ))}
        </div>
      )}

      {/* Photo count badge */}
      {count > 1 && !isDetail && (
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
          {current + 1}/{count}
        </div>
      )}
      {isDetail && count > 1 && (
        <div className="absolute top-3 right-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
          {current + 1} / {count}
        </div>
      )}
    </div>
  );
}
