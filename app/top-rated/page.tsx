'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShieldCheck, ArrowRight, Bookmark, BookmarkCheck } from 'lucide-react';
import { CITIES_DATA } from '@/lib/travelData';
import { Place, City } from '@/lib/types';
import { useApp } from '@/components/AppContext';

export default function TopRatedPage() {
  const { toggleSavePlace, isPlaceSaved } = useApp();

  // Extract and rank places by rating
  const topPlaces = useMemo(() => {
    const list: { place: Place; city: City }[] = [];
    CITIES_DATA.forEach((city) => {
      city.places.forEach((place) => {
        list.push({ place, city });
      });
    });
    return list.sort((a, b) => b.place.rating - a.place.rating);
  }, []);

  return (
    <div className="min-h-screen py-12 md:py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] font-sans font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>ROMELY Top Rated Honor Roll</span>
            <span aria-hidden="true">·</span>
            <span>9.5+ Distinction</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-stone-900 dark:text-white">
            Landmarks of Supreme Distinction
          </h1>

          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
            Our highest-rated architectural sanctuaries, awarded for transcendent light, acoustic purity, and generational craftsmanship.
          </p>
        </div>

        {/* Highlighted #1 Sanctuary Banner */}
        {topPlaces[0] && (
          <div className="relative rounded-3xl overflow-hidden border border-stone-200 dark:border-white/10 shadow-lg bg-stone-900">
            <div className="relative h-[420px] md:h-[480px] w-full">
              <Image
                src={topPlaces[0].place.images[0] || topPlaces[0].city.heroImage}
                alt={topPlaces[0].place.name}
                fill
                priority
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between text-white">
                <div className="flex items-center justify-between">
                  <div className="backdrop-blur-md bg-black/50 px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-mono text-[#E6CBA3] flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-[#E6CBA3]" />
                    <span>Highest Rated: {topPlaces[0].place.rating} / 10</span>
                  </div>

                  <button
                    onClick={() => toggleSavePlace(topPlaces[0].place.id)}
                    className="p-2.5 rounded-full backdrop-blur-md bg-black/50 border border-white/20 hover:bg-black/70 transition-colors cursor-pointer"
                  >
                    {isPlaceSaved(topPlaces[0].place.id) ? (
                      <BookmarkCheck className="w-4 h-4 text-[#C5A880]" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>

                <div className="space-y-3 max-w-2xl">
                  <div className="text-xs uppercase tracking-widest text-[#E6CBA3] font-sans">
                    {topPlaces[0].city.name} · {topPlaces[0].place.category} · {topPlaces[0].place.neighborhood}
                  </div>
                  <h2 className="text-3xl md:text-5xl font-serif font-light">
                    {topPlaces[0].place.name}
                  </h2>
                  <p className="text-sm md:text-base text-stone-200 font-sans line-clamp-2">
                    {topPlaces[0].place.tagline}
                  </p>
                  <div className="pt-2">
                    <Link
                      href={`/place/${topPlaces[0].place.id}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C5A880] hover:bg-[#b89a71] text-stone-950 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all duration-200 active:scale-95"
                    >
                      <span>Read Monograph</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ranked Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {topPlaces.slice(1).map(({ place, city }, index) => {
            const saved = isPlaceSaved(place.id);
            return (
              <article
                key={place.id}
                className="group rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between bg-white dark:bg-[#121215] border-stone-200 dark:border-white/10 hover:border-[#C5A880]/60 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(197,168,128,0.12)] cursor-pointer"
              >
                <div className="relative h-60 w-full overflow-hidden bg-stone-800">
                  <Link href={`/place/${place.id}`} className="block w-full h-full">
                    <Image
                      src={place.images[0] || city.heroImage}
                      alt={place.name}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </Link>

                  <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
                    <span className="backdrop-blur-md bg-black/60 px-2.5 py-1 rounded text-xs font-mono text-white border border-white/15 flex items-center gap-1 font-semibold">
                      <Star className="w-3 h-3 text-[#C5A880] fill-[#C5A880]" />
                      <span>{place.rating}</span>
                    </span>
                    <span className="backdrop-blur-md bg-black/40 px-2 py-0.5 rounded text-[10px] text-stone-300 font-mono">
                      #{index + 2}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleSavePlace(place.id);
                    }}
                    className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md border transition-all duration-200 cursor-pointer ${
                      saved
                        ? 'bg-[#C5A880] text-black border-[#C5A880]'
                        : 'bg-black/40 text-white border-white/20 hover:bg-black/60'
                    }`}
                  >
                    {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>

                  <Link
                    href={`/place/${place.id}`}
                    className="absolute bottom-4 left-4 right-4 text-white block"
                  >
                    <div className="text-[11px] uppercase tracking-wider text-[#E6CBA3] font-medium font-sans">
                      {city.name} · {place.neighborhood}
                    </div>
                    <h3 className="text-xl font-serif font-medium group-hover:text-[#E6CBA3] transition-colors">
                      {place.name}
                    </h3>
                  </Link>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs leading-relaxed line-clamp-2 text-stone-600 dark:text-stone-300">
                    {place.tagline}
                  </p>

                  <div className="pt-3 border-t border-stone-100 dark:border-white/5 flex items-center justify-between text-xs">
                    <span className="font-mono text-[#C5A880] font-medium">
                      Curator Score: {place.curatorScore}
                    </span>

                    <Link
                      href={`/place/${place.id}`}
                      className="flex items-center gap-1.5 text-[#C5A880] hover:text-[#b5966d] font-medium group-hover:translate-x-1.5 transition-transform duration-200"
                    >
                      <span>View Monograph</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

