// components/ImageCarousel.tsx
'use client';
import { useState } from 'react';

interface Image {
  url: string;
  alt: string;
  credit?: string;
}

interface ImageCarouselProps {
  images: Image[];
  travelTime?: string;
  price?: string;
  tagline?: string;
}

export default function ImageCarousel({ images, travelTime, price, tagline }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  return (
    <div className="relative w-full bg-white neo-card overflow-hidden mb-6">
      {/* Images */}
      <div className="relative h-64 md:h-80 bg-gray-200">
        {images.map((image, index) => (
          <div key={index} className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}>
            {imageErrors.has(index) ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 font-bold">
                📷 Image non disponible
              </div>
            ) : (
              <img
                src={image.url}
                alt={image.alt}
                className="absolute inset-0 w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
                onError={() => handleImageError(index)}
                style={{ WebkitBackfaceVisibility: 'hidden' }}
              />
            )}
          </div>
        ))}

        {/* Time Card - Bottom Left */}
        {travelTime && (
          <div className="absolute bottom-3 left-3 bg-[#4ECDC4] neo-card px-4 py-2 font-bold text-sm">
            🚂 {travelTime}
          </div>
        )}

        {/* Price Card - Bottom Right */}
        {price && (
          <div className="absolute bottom-3 right-3 bg-[#FFE951] neo-card px-4 py-2 font-bold text-sm">
            💰 {price.replace(/€(\d+)/, '$1€')}
          </div>
        )}

        {/* Tagline - Bottom Center */}
        {tagline && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 font-bold text-sm rounded text-center max-w-[90%]">
            {tagline}
          </div>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition z-10"
              aria-label="Image précédente"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition z-10"
              aria-label="Image suivante"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Photo Credit */}
        {images[currentIndex].credit && (
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            Photo: {images[currentIndex].credit}
          </div>
        )}
      </div>

      {/* Dots Navigation */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 py-3 bg-gray-100">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`w-2 h-2 rounded-full transition ${
                index === currentIndex ? 'bg-black w-6' : 'bg-gray-400'
              }`}
              aria-label={`Aller à l'image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}