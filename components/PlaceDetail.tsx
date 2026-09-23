'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Clock,
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
  Sparkles,
  Quote,
  Maximize2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { City, Place } from '@/lib/types';
import { useApp } from './AppContext';

interface PlaceDetailProps {
  place: Place;
  city: City;
}

export function PlaceDetail({ place, city }: PlaceDetailProps) {
  const { toggleSavePlace, isPlaceSaved } = useApp();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const saved = isPlaceSaved(place.id);
  const images = place.images.length > 0 ? place.images : [city.heroImage];
  const activeImage = images[selectedImageIndex] || images[0];

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(place.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: `${place.name} — ${city.name} Travel Guide`,
          text: place.tagline,
          url: window.location.href,
        })
        .catch(() => {});
    } else if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${place.name} ${place.address}`
  )}`;

  const nearbyPlaces = city.places.filter((p) => p.id !== place.id).slice(0, 3);

  return (
    <div className="min-h-screen pb-24">
      {/* Top Breadcrumb Bar */}
      <div className="border-b px-6 py-4 transition-colors bg-[#FAF8F5] dark:bg-[#0E0E12] border-stone-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <nav className="flex items-center gap-2 text-stone-500 overflow-x-auto py-1">
            <Link
              href={`/city/${city.id}`}
              className="hover:text-stone-900 dark:hover:text-white transition-colors flex items-center gap-1.5 shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>{city.name}</span>
            </Link>
            <span aria-hidden="true" className="opacity-40">/</span>
            <Link
              href="/sanctuaries"
              className="hover:text-stone-900 dark:hover:text-white transition-colors shrink-0"
            >
              {place.category}
            </Link>
            <span aria-hidden="true" className="opacity-40">/</span>
            <span className="shrink-0 font-medium truncate max-w-[200px] sm:max-w-xs text-stone-900 dark:text-white">
              {place.name}
            </span>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg border text-xs transition-colors flex items-center gap-1.5 border-stone-200 dark:border-white/10 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5 active:scale-95 cursor-pointer"
              title="Share monograph"
            >
              {copiedShare ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Share2 className="w-3.5 h-3.5 text-stone-400" />
              )}
              <span className="hidden sm:inline">{copiedShare ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={() => toggleSavePlace(place.id)}
              className={`px-3.5 py-2 rounded-lg border text-xs font-medium transition-all duration-200 flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                saved
                  ? 'bg-[#C5A880] text-black border-[#C5A880]'
                  : 'bg-white dark:bg-transparent text-stone-900 dark:text-white border-stone-200 dark:border-white/20 hover:border-[#C5A880]'
              }`}
            >
              {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{saved ? 'Saved in Itinerary' : 'Save Place'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-12">
        {/* 1. Photo Gallery Header */}
        <section className="space-y-4">
          <div className="relative h-[380px] sm:h-[480px] lg:h-[540px] w-full rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.1)] border border-stone-200/50 dark:border-white/10 bg-stone-900 group">
            <Image
              src={activeImage}
              alt={place.name}
              fill
              priority
              className="object-cover transition-transform duration-700 ease-out"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

            <button
              onClick={() => setLightboxOpen(true)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 hover:bg-black/70 transition-colors cursor-pointer"
              title="Expand photography"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-[#E6CBA3] font-medium font-sans">
                <Link href={`/city/${city.id}`} className="hover:underline">
                  {city.name}
                </Link>
                <span aria-hidden="true">·</span>
                <span>{place.neighborhood}</span>
                <span aria-hidden="true">·</span>
                <span>{place.category}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight">
                {place.name}
              </h1>

              {place.nativeName && place.nativeName !== place.name && (
                <div className="text-sm sm:text-base text-stone-300 font-serif italic">
                  {place.nativeName}
                </div>
              )}

              <p className="text-sm sm:text-base text-stone-200 max-w-2xl font-sans pt-1">
                {place.tagline}
              </p>
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative h-20 w-28 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    selectedImageIndex === index
                      ? 'border-[#C5A880] ring-2 ring-[#C5A880]/30'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${place.name} ${index + 1}`}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 2. Main Two-Column Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-10">
            {/* Curator Score Banner */}
            <div className="p-6 rounded-2xl border flex items-center justify-between bg-white dark:bg-[#121215] border-stone-200 dark:border-white/10 shadow-xs">
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-[#C5A880] font-sans font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  ROMELY In-House Rating
                </span>
                <div className="text-2xl font-serif font-medium text-stone-900 dark:text-white">
                  {place.curatorScore}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-sans">
                  Price Level
                </span>
                <span className="font-mono text-lg text-[#C5A880] font-medium">
                  {place.priceLevel}
                </span>
              </div>
            </div>

            {/* Monograph Description */}
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-widest text-[#C5A880] font-sans font-medium block">
                The Monograph
              </span>

              <div className="text-base sm:text-lg font-serif font-light leading-relaxed space-y-4 first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 text-stone-800 dark:text-stone-200">
                <p>{place.description}</p>
              </div>
            </div>

            {/* Verdict */}
            <div className="p-8 rounded-2xl border relative bg-white dark:bg-[#141418] border-stone-200 dark:border-white/10 shadow-xs">
              <Quote className="w-8 h-8 text-[#C5A880]/30 absolute top-6 right-6" />
              <div className="space-y-3">
                <span className="text-[11px] uppercase tracking-widest text-[#C5A880] font-sans font-medium block">
                  The Curator’s Verdict
                </span>
                <p className="font-serif text-xl sm:text-2xl italic text-stone-900 dark:text-white">
                  &ldquo;{place.editorialVerdict}&rdquo;
                </p>
                <div className="pt-2 text-xs text-stone-400">
                  <span>{place.curatorQuote.curator}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{place.curatorQuote.role}</span>
                </div>
              </div>
            </div>

            {/* Atmosphere */}
            <div className="space-y-3 pt-2">
              <span className="text-xs uppercase tracking-widest text-stone-400 font-sans font-medium block">
                Atmosphere & Sensorial Qualities
              </span>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-600 dark:text-stone-300 font-sans">
                {place.atmosphere.map((atm, idx) => (
                  <React.Fragment key={atm}>
                    <span className="font-medium">{atm}</span>
                    {idx < place.atmosphere.length - 1 && (
                      <span aria-hidden="true" className="text-[#C5A880]">·</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Insider Tip */}
            <div className="p-6 rounded-xl border space-y-2 bg-[#F9F7F2] dark:bg-[#141418] border-stone-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#C5A880] font-medium font-sans">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Insider Secret</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300">
                {place.insiderTip}
              </p>
            </div>
          </div>

          {/* Right Column: Practical Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl p-6 sm:p-8 border space-y-6 bg-white dark:bg-[#121215] border-stone-200 dark:border-white/10 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-white/10">
                <h3 className="font-serif text-xl text-stone-900 dark:text-white">
                  Practical Information
                </h3>
                <span className="text-xs text-stone-400 font-mono">
                  {place.neighborhood}
                </span>
              </div>

              <div className="space-y-3">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-[#C5A880] hover:bg-[#b5966d] text-stone-950 font-sans text-xs uppercase tracking-widest font-semibold rounded-xl transition-all duration-200 hover:shadow-xs active:scale-95"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="h-36 rounded-xl border relative overflow-hidden flex flex-col justify-end p-4 bg-stone-100 dark:bg-[#18181D] border-stone-200 dark:border-white/10">
                  <div
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
                      backgroundSize: '16px 16px',
                    }}
                  />
                  <div className="relative z-10 flex items-center justify-between text-xs">
                    <span className="font-mono text-stone-500">
                      {place.coordinates.lat.toFixed(4)}°N, {place.coordinates.lng.toFixed(4)}°E
                    </span>
                    <span className="text-[11px] text-[#C5A880] font-sans font-medium">
                      GPS Direct
                    </span>
                  </div>
                </div>
              </div>

              <dl className="space-y-4 text-xs divide-y divide-stone-100 dark:divide-white/5">
                {place.phone && (
                  <div className="pt-3 flex flex-col gap-1">
                    <dt className="text-stone-400 uppercase tracking-wider">
                      Concierge & Inquiries
                    </dt>
                    <dd className="font-mono text-stone-900 dark:text-white">
                      {place.phone}
                    </dd>
                  </div>
                )}

                <div className="pt-3 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <dt className="text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Address</span>
                    </dt>
                    <button
                      onClick={handleCopyAddress}
                      className="text-[10px] text-[#C5A880] hover:underline cursor-pointer"
                    >
                      {copiedAddress ? 'Copied to clipboard' : 'Copy address'}
                    </button>
                  </div>
                  <dd className="leading-relaxed font-sans text-stone-800 dark:text-stone-200">
                    {place.address}
                  </dd>
                </div>

                <div className="pt-3 space-y-2">
                  <dt className="text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Hours of Operation</span>
                  </dt>
                  <dd className="space-y-1">
                    {place.hours.map((h, i) => (
                      <div key={i} className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-stone-500">{h.days}</span>
                        <span className="text-stone-800 dark:text-stone-200">{h.time}</span>
                      </div>
                    ))}
                  </dd>
                </div>

                <div className="pt-3 space-y-1">
                  <dt className="text-stone-400 uppercase tracking-wider">
                    Optimal Visiting Cadence
                  </dt>
                  <dd className="leading-relaxed font-sans text-stone-700 dark:text-stone-200">
                    {place.bestTimeToVisit}
                  </dd>
                </div>

                <div className="pt-3 space-y-1">
                  <dt className="text-stone-400 uppercase tracking-wider">
                    Dress Code Guidance
                  </dt>
                  <dd className="leading-relaxed font-sans text-stone-700 dark:text-stone-200">
                    {place.dressCode}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* 3. Nearby Curated Recommendations */}
        {nearbyPlaces.length > 0 && (
          <section className="pt-12 border-t border-stone-200 dark:border-white/10 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#C5A880] font-sans font-medium block mb-1">
                  More in {city.name}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-stone-900 dark:text-white">
                  Complementary Sanctuaries
                </h3>
              </div>
              <Link
                href={`/city/${city.id}`}
                className="text-xs text-[#C5A880] hover:underline flex items-center gap-1 font-medium font-sans"
              >
                <span>View all {city.places.length} places in {city.name}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {nearbyPlaces.map((np) => (
                <Link
                  key={np.id}
                  href={`/place/${np.id}`}
                  className="group rounded-2xl overflow-hidden border p-5 transition-all duration-300 bg-white dark:bg-[#121215] border-stone-200 dark:border-white/10 hover:border-[#C5A880]/60 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(197,168,128,0.12)] cursor-pointer block"
                >
                  <div className="relative h-44 w-full rounded-xl overflow-hidden mb-3 bg-stone-800">
                    <Image
                      src={np.images[0] || city.heroImage}
                      alt={np.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-mono">
                      {np.category}
                    </div>
                  </div>
                  <h4 className="font-serif text-lg font-medium group-hover:text-[#C5A880] transition-colors text-stone-900 dark:text-white">
                    {np.name}
                  </h4>
                  <p className="text-xs line-clamp-2 mt-1 leading-relaxed text-stone-600 dark:text-stone-400">
                    {np.tagline}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-full h-[80vh]">
              <Image
                src={activeImage}
                alt={place.name}
                fill
                className="object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="pt-4 text-center text-xs text-stone-300 font-sans">
              <span>{place.name} — {place.neighborhood}, {city.name}</span>
              <span className="block text-[11px] text-stone-500 mt-1">Click anywhere to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
