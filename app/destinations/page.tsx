'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, CloudSun, Sparkles, X } from 'lucide-react';
import { CITIES_DATA } from '@/lib/travelData';
import {
  cityHasMatchingPlaces,
  cityMatchesQuery,
  getDestinationSummaries,
  resolveSearchTarget,
} from '@/lib/search';
import { CityClock } from '@/components/CityClock';

export default function DestinationsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<'All' | 'Europe' | 'Asia' | 'Mediterranean'>('All');

  const trimmedQuery = searchQuery.trim();
  const destinationSummaries = useMemo(() => getDestinationSummaries(CITIES_DATA), []);

  // Cities that match the query on their own copy or on a curated place, before
  // the region tab is applied.
  const matchingCities = useMemo(() => {
    if (!trimmedQuery) return CITIES_DATA;
    return CITIES_DATA.filter(
      (city) => cityMatchesQuery(city, trimmedQuery) || cityHasMatchingPlaces(city, trimmedQuery)
    );
  }, [trimmedQuery]);

  const filteredCities = useMemo(
    () => matchingCities.filter((city) => selectedRegion === 'All' || city.region === selectedRegion),
    [matchingCities, selectedRegion]
  );

  const isUnknownQuery = trimmedQuery.length > 0 && matchingCities.length === 0;

  // Enter resolves the query against the whole catalogue — ignoring the region tab —
  // and routes to the matching city or sanctuary. A query with no catalogue match
  // keeps the visitor on the page and reveals the "Coming Soon" curation state.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    const target = resolveSearchTarget(CITIES_DATA, searchQuery);
    if (target) {
      router.push(target.kind === 'city' ? `/city/${target.cityId}` : `/place/${target.placeId}`);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRegion('All');
  };

  return (
    <div className="min-h-screen py-12 md:py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Lockup */}
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] font-sans font-medium">
            <span>Global Compendium</span>
            <span aria-hidden="true">·</span>
            <span>{CITIES_DATA.length} Curated Cities</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-stone-900 dark:text-white">
            Destinations of Quiet Reverie
          </h1>

          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
            From the Haussmann boulevards of Paris to the quiet moss gardens of Tokyo and the ancient terracotta palazzos of Rome. Explore curated city monographs vetted by architectural curators.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-stone-200 dark:border-white/10">
          {/* Region Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl border bg-stone-100 dark:bg-[#141417] border-stone-200 dark:border-white/10 overflow-x-auto">
            {(['All', 'Europe', 'Asia', 'Mediterranean'] as const).map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  selectedRegion === region
                    ? 'bg-white dark:bg-[#202026] text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {region}
              </button>
            ))}
          </div>

          {/* Search Input with Enter key support */}
          <div className="relative flex items-center w-full md:w-80 p-2 rounded-xl border bg-white dark:bg-[#141417] border-stone-200 dark:border-white/10 focus-within:border-[#C5A880] transition-colors shadow-xs">
            <Search className="w-4 h-4 text-stone-400 ml-2 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search destinations (press Enter)..."
              className="w-full bg-transparent text-xs focus:outline-none placeholder:text-stone-400 text-stone-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Cities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCities.map((city) => (
            <Link
              key={city.id}
              href={`/city/${city.id}`}
              className="group rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between bg-white dark:bg-[#121215] border-stone-200 dark:border-white/10 hover:border-[#C5A880]/60 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(197,168,128,0.12)] cursor-pointer"
            >
              <div className="relative h-64 w-full overflow-hidden bg-stone-800">
                <Image
                  src={city.heroImage}
                  alt={`${city.name}, ${city.country}`}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                  <span className="backdrop-blur-md bg-black/40 px-2.5 py-1 rounded-md border border-white/10 font-mono">
                    <CityClock timezone={city.timezone} />
                  </span>

                  <span className="backdrop-blur-md bg-black/40 px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5 font-sans">
                    <CloudSun className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>{city.weather.tempC}°C</span>
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="text-xs uppercase tracking-widest text-[#E6CBA3] font-medium mb-1">
                    {city.country}
                  </div>
                  <h3 className="text-2xl font-serif font-normal tracking-tight group-hover:text-[#E6CBA3] transition-colors">
                    {city.name}
                  </h3>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#C5A880] font-sans font-medium">
                    <span>{city.badge}</span>
                    <span aria-hidden="true">·</span>
                    <span>{city.places.length} Curated Places</span>
                  </div>

                  <p className="text-sm leading-relaxed line-clamp-2 text-stone-600 dark:text-stone-300">
                    {city.tagline}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-white/5 flex items-center justify-between text-xs">
                  <div className="font-sans text-stone-500 dark:text-stone-400">
                    <span>{city.weather.condition}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[#C5A880] font-medium group-hover:translate-x-1.5 transition-transform duration-200">
                    <span>Explore City Monograph</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming Soon state when nothing in the catalogue answers the query */}
        {filteredCities.length === 0 && (
          <div className="py-20 text-center space-y-4 max-w-xl mx-auto">
            {isUnknownQuery ? (
              <>
                <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] font-sans font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>Under Archival Consideration</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl text-stone-900 dark:text-white">
                  &ldquo;{trimmedQuery}&rdquo; Coming Soon
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-sans">
                  Our architectural curators are still researching monographs for this location.
                  The destinations below are already published.
                </p>
              </>
            ) : (
              <h3 className="font-serif text-2xl text-stone-500">
                No curated destinations in this region match your search.
              </h3>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
              {destinationSummaries.map((destination) => (
                <Link
                  key={destination.id}
                  href={`/city/${destination.id}`}
                  className="px-3 py-1.5 rounded-md border border-stone-200 dark:border-white/10 bg-white dark:bg-[#141418] text-stone-800 dark:text-stone-200 hover:border-[#C5A880] hover:text-[#C5A880] transition-colors font-medium"
                >
                  {destination.name} ({destination.placeCount})
                </Link>
              ))}
            </div>

            <button
              onClick={resetFilters}
              className="text-xs uppercase tracking-wider text-[#C5A880] hover:underline cursor-pointer font-medium"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
