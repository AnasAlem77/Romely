'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, BookmarkCheck, ArrowRight, Star } from 'lucide-react';
import SearchDropdown from '@/components/SearchDropdown';
import { CITIES_DATA } from '@/lib/travelData';
import { Place, City } from '@/lib/types';
import { useApp } from '@/components/AppContext';

export default function SanctuariesPage() {
  const { toggleSavePlace, isPlaceSaved } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  

  // Flatten all places with their parent city
  const allPlaces = useMemo(() => {
    const list: { place: Place; city: City }[] = [];
    CITIES_DATA.forEach((city) => {
      city.places.forEach((place) => {
        list.push({ place, city });
      });
    });
    return list;
  }, []);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    allPlaces.forEach(({ place }) => set.add(place.category));
    return ['All', ...Array.from(set)];
  }, [allPlaces]);

  // Filtered places (by category and city)
  const filteredPlaces = useMemo(() => {
    return allPlaces.filter(({ place, city }) => {
      const matchesCat = selectedCategory === 'All' || place.category === selectedCategory;
      const matchesCity = selectedCity === 'All' || city.id === selectedCity;
      return matchesCat && matchesCity;
    });
  }, [allPlaces, selectedCategory, selectedCity]);

  return (
    <div className="min-h-screen py-12 md:py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider sm:tracking-widest text-[#C5A880] font-sans font-medium">
            <span>Architectural Index</span>
            <span aria-hidden="true">·</span>
            <span>{allPlaces.length} Vetted Sanctuaries Worldwide</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-stone-900 dark:text-white">
            Architectural Sanctuaries
          </h1>

          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
            A comprehensive catalog of quiet courtyards, heritage cafes, sacred architecture, and boutique hospitality. Vetted for architectural distinction and acoustic serenity.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col gap-4 pb-8 border-b border-stone-200 dark:border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Segmented Control */}
            <div className="flex items-center gap-1 p-1 rounded-xl border bg-stone-100 dark:bg-[#141417] border-stone-200 dark:border-white/10 overflow-x-auto no-scrollbar max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 sm:px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-white dark:bg-[#202026] text-stone-900 dark:text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* City & Search controls */}
            <div className="flex items-center gap-3">
              {/* City Filter */}
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs border bg-white dark:bg-[#141417] border-stone-200 dark:border-white/10 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-[#C5A880]"
              >
                <option value="All">All Cities</option>
                {CITIES_DATA.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Search */}
                              <SearchDropdown cities={CITIES_DATA} />

              </div>
            </div>
          </div>
        </div>

        {/* Places Grid: 2 columns on mobile, 2 on md, 3 on lg */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {filteredPlaces.map(({ place, city }) => {
            const saved = isPlaceSaved(place.id);
            return (
              <article
                key={place.id}
                className="group rounded-xl sm:rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between bg-white dark:bg-[#121215] border-stone-200 dark:border-white/10 hover:border-[#C5A880]/60 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(197,168,128,0.12)] cursor-pointer"
              >
                <div className="relative h-36 sm:h-48 md:h-60 w-full overflow-hidden bg-stone-800">
                  <Link href={`/place/${place.id}`} className="block w-full h-full">
                    <Image
                      src={place.images[0] || city.heroImage}
                      alt={place.name}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  </Link>

                  {/* Bookmark Toggle */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleSavePlace(place.id);
                    }}
                    className={`absolute top-2 right-2 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full backdrop-blur-md border transition-all duration-200 cursor-pointer ${
                      saved
                        ? 'bg-[#C5A880] text-black border-[#C5A880]'
                        : 'bg-black/40 text-white border-white/20 hover:bg-black/60'
                    }`}
                    aria-label={saved ? 'Remove from saved' : 'Save place'}
                  >
                    {saved ? <BookmarkCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </button>

                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex items-center gap-1 sm:gap-2 pointer-events-none">
                    <span className="backdrop-blur-md bg-black/40 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded text-[10px] sm:text-xs font-mono text-white border border-white/15 flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#C5A880] fill-[#C5A880]" />
                      <span>{place.rating}</span>
                    </span>
                  </div>

                  <Link
                    href={`/place/${place.id}`}
                    className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 text-white block"
                  >
                    <div className="text-[9px] sm:text-[11px] uppercase tracking-wider text-[#E6CBA3] font-medium font-sans truncate">
                      {city.name} · {place.neighborhood}
                    </div>
                    <h3 className="text-sm sm:text-lg md:text-xl font-serif font-medium group-hover:text-[#E6CBA3] transition-colors truncate">
                      {place.name}
                    </h3>
                  </Link>
                </div>

                <div className="p-3 sm:p-5 md:p-6 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <p className="text-xs sm:text-xs leading-relaxed line-clamp-2 text-stone-600 dark:text-stone-300 hidden sm:block">
                      {place.tagline}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-1.5 sm:gap-x-2 text-[10px] sm:text-[11px] text-stone-400">
                      {place.atmosphere.slice(0, 2).map((item, idx) => (
                        <React.Fragment key={item}>
                          <span className="truncate">{item}</span>
                          {idx < Math.min(place.atmosphere.length, 2) - 1 && (
                            <span aria-hidden="true" className="opacity-40">·</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 sm:pt-3 border-t border-stone-100 dark:border-white/5 flex items-center justify-between text-[10px] sm:text-xs">
                    <span className="font-mono text-[#C5A880] font-medium tracking-wider">
                      {place.priceLevel}
                    </span>

                    <Link
                      href={`/place/${place.id}`}
                      className="flex items-center gap-1 text-[#C5A880] hover:text-[#b5966d] font-medium group-hover:translate-x-1 transition-transform duration-200"
                    >
                      <span className="hidden sm:inline">View Monograph</span>
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        
      </div>

  );
}

