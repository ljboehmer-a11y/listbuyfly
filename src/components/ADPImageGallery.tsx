'use client';

import { useState } from 'react';
import ImageCarousel from '@/components/ImageCarousel';
import ImageLightbox from '@/components/ImageLightbox';

interface ADPImageGalleryProps {
  images: string[];
  alt: string;
}

export default function ADPImageGallery({ images, alt }: ADPImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  return (
    <>
      {/* Main image carousel — click opens lightbox */}
      <div className="mb-8 cursor-pointer" onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}>
        <ImageCarousel images={images} alt={alt} variant="detail" />
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`${alt} thumbnail ${i + 1}`}
            className="w-24 h-16 object-cover rounded-lg border-2 border-gray-200 hover:border-amber-500 cursor-pointer transition-colors flex-shrink-0"
            onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
          />
        ))}
      </div>

      {/* Fullscreen Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={images}
          alt={alt}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
