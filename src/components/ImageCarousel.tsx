'use client';

import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  /** 'card' = SRP thumbnail, 'detail' = ADP full gallery */
  variant?: 'card' | 'detail';
}

export default function ImageCarousel({ images, alt, variant = 'card' }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) next();
      else prev();
    }
    setTouchStart(null);
  };

  if (count === 0) {
    return (
      <div className={`bg-gradient-to-b from-slate-200 to-slate-100 flex items-center justify-center ${variant === 'detail' ? 'h-[500px] rounded-lg' : 'h-full'}`}>
        <span className="text-slate-400 text-sm">No photos</span>
      </div>
    );
  }

  const isDetail = variant === 'detail';

  return (
    <div
      className={`relative overflow-hidden group ${isDetail ? 'h-[500px] rounded-lg' : 'h-full'}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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

      {/* Navigation arrows */}
      {count > 1 && (
        <>
          <button
            onClick={prev}
            className={`absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all ${
              isDetail ? 'w-10 h-10 opacity-80' : 'w-8 h-8 opacity-0 group-hover:opacity-100'
            } flex items-center justify-center`}
          >
            <ChevronLeft className={isDetail ? 'w-6 h-6' : 'w-5 h-5'} />
          </button>
          <button
            onClick={next}
            className={`absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all ${
              isDetail ? 'w-10 h-10 opacity-80' : 'w-8 h-8 opacity-0 group-hover:opacity-100'
            } flex items-center justify-center`}
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
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
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
