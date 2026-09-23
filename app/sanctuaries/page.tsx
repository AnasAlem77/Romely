'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Bookmark, BookmarkCheck, ArrowRight, Star, X } from 'lucide-react';
import { CITIES_DATA } from '@/lib/travelData';
import { Place, City } from '@/lib/types';
import { useApp } from '@/components/AppContext';

export default function SanctuariesPage() {
  const { toggleSavePlace, isPlaceSaved } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filtered places
  const filteredPlaces = useMemo(() => {
    return allPlaces.filter(({ place, city }) => {
      const matchesCat = selectedCategory === 'All' || place.category === selectedCategory;
      const matchesCity = selectedCity === 'All' || city.id === selectedCity;
      const q = searchQuery.toLowerCase().trim();

      if (!q) return matchesCat && matchesCity;

      const matchesText =
        place.name.toLowerCase().includes(q) ||
        place.tagline.toLowerCase().includes(q) ||
        place.neighborhood.toLowerCase().includes(q) ||
        city.name.toLowerCase().includes(q);

      return matchesCat && matchesCity && matchesText;
    });
  }, [allPlaces, selectedCategory, selectedCity, searchQuery]);

  return (
    <div className="min-h-screen py-12 md:py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] font-sans font-medium">
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
            <div className="flex items-center gap-1 p-1 rounded-xl border bg-stone-100 dark:bg-[#141417] border-stone-200 dark:border-white/10 overflow-x-auto max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer ${
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
              <div className="relative flex items-center p-2 rounded-xl border bg-white dark:bg-[#141417] border-stone-200 dark:border-white/10 focus-within:border-[#C5A880] w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-stone-400 ml-1.5 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sanctuaries..."
                  className="w-full bg-transparent text-xs focus:outline-none placeholder:text-stone-400 text-stone-900 dark:text-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Places Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlaces.map(({ place, city }) => {
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

                  {/* Bookmark Toggle */}
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
                    aria-label={saved ? 'Remove from saved' : 'Save place'}
                  >
                    {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>

                  <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
                    <span className="backdrop-blur-md bg-black/40 px-2.5 py-1 rounded text-xs font-mono text-white border border-white/15 flex items-center gap-1">
                      <Star className="w-3 h-3 text-[#C5A880] fill-[#C5A880]" />
                      <span>{place.rating} / 10</span>
                    </span>
                  </div>

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
                  <div className="space-y-2">
                    <p className="text-xs leading-relaxed line-clamp-2 text-stone-600 dark:text-stone-300">
                      {place.tagline}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-stone-400 pt-1">
                      {place.atmosphere.slice(0, 3).map((item, idx) => (
                        <React.Fragment key={item}>
                          <span>{item}</span>
                          {idx < Math.min(place.atmosphere.length, 3) - 1 && (
                            <span aria-hidden="true" className="opacity-40">·</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 dark:border-white/5 flex items-center justify-between text-xs">
                    <span className="font-mono text-[#C5A880] font-medium tracking-wider">
                      {place.priceLevel}
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

        {filteredPlaces.length === 0 && (
          <div className="py-20 text-center space-y-3">
            <p className="font-serif text-2xl text-stone-500">No sanctuaries found matching your criteria.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedCity('All');
                setSearchQuery('');
              }}
              className="text-xs uppercase tracking-wider text-[#C5A880] hover:underline cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

