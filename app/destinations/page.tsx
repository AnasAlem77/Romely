'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, CloudSun, Sparkles, X } from 'lucide-react';
import {
  cityHasMatchingPlaces,
  cityMatchesQuery,
  getDestinationSummaries,
  resolveSearchTarget,
} from '@/lib/search';
import { CityClock } from '@/components/CityClock';
import SearchDropdown from '@/components/SearchDropdown';
import { useApp } from '@/components/AppContext';

export default function DestinationsPage() {
  const { cities } = useApp();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<'All' | 'Europe' | 'Asia' | 'Mediterranean'>('All');

  const trimmedQuery = searchQuery.trim();
  const destinationSummaries = useMemo(() => getDestinationSummaries(cities), [cities]);

  // Cities that match the query on their own copy or on a curated place, before
  // the region tab is applied.
  const matchingCities = useMemo(() => {
    if (!trimmedQuery) return cities;
    return cities.filter(
      (city) => cityMatchesQuery(city, trimmedQuery) || cityHasMatchingPlaces(city, trimmedQuery)
    );
  }, [cities, trimmedQuery]);

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

    const target = resolveSearchTarget(cities, searchQuery);
    if (target) {
      router.push(target.kind === 'city' ? `/city/${target.cityId}` : `/place/${target.placeId}`);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRegion('All');
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 md:py-14">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-10">
        {/* Header Lockup */}
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider sm:tracking-widest text-[#C5A880] font-sans font-medium">
            <span>Global Compendium</span>
            <span aria-hidden="true">·</span>
            <span>{cities.length} Curated Cities</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-stone-900 dark:text-white">
            Destinations of Quiet Reverie
          </h1>

          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
            From the Haussmann boulevards of Paris to the quiet moss gardens of Tokyo and the ancient terracotta palazzos of Rome. Explore curated city monographs vetted by architectural curators.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-white/10">
          {/* Region Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl border bg-stone-100 dark:bg-[#141417] border-stone-200 dark:border-white/10 overflow-x-auto no-scrollbar max-w-full">
            {(['All', 'Europe', 'Asia', 'Mediterranean'] as const).map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  selectedRegion === region
                    ? 'bg-white dark:bg-[#202026] text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {region}
              </button>
            ))}
          </div>

            <SearchDropdown cities={cities} />
        </div>

        {/* Cities Grid: 2 columns on mobile, 2 on md, 3 on lg */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {filteredCities.map((city) => (
            <Link
              key={city.id}
              href={`/city/${city.id}`}
              className="group rounded-xl sm:rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between bg-white dark:bg-[#121215] border-stone-200 dark:border-white/10 hover:border-[#C5A880]/60 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(197,168,128,0.12)] cursor-pointer"
            >
              <div className="relative h-36 sm:h-52 md:h-64 w-full overflow-hidden bg-stone-800">
                <Image
                  src={city.heroImage}
                  alt={`${city.name}, ${city.country}`}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between text-[10px] sm:text-xs text-white">
                  <span className="backdrop-blur-md bg-black/40 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded sm:rounded-md border border-white/10 font-mono text-[9px] sm:text-xs">
                    <CityClock timezone={city.timezone} />
                  </span>

                  <span className="backdrop-blur-md bg-black/40 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded sm:rounded-md border border-white/10 flex items-center gap-1 sm:gap-1.5 font-sans text-[9px] sm:text-xs">
                    <CloudSun className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C5A880]" />
                    <span>{city.weather.tempC}°C</span>
                  </span>
                </div>

                <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 text-white">
                  <div className="text-[9px] sm:text-xs uppercase tracking-wider sm:tracking-widest text-[#E6CBA3] font-medium mb-0.5 sm:mb-1 truncate">
                    {city.country}
                  </div>
                  <h3 className="text-base sm:text-xl md:text-2xl font-serif font-normal tracking-tight group-hover:text-[#E6CBA3] transition-colors truncate">
                    {city.name}
                  </h3>
                </div>
              </div>

              <div className="p-3 sm:p-5 md:p-6 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[#C5A880] font-sans font-medium truncate">
                    <span>{city.badge}</span>
                    <span aria-hidden="true">·</span>
                    <span>{city.places.length} Places</span>
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed line-clamp-2 text-stone-600 dark:text-stone-300 hidden sm:block">
                    {city.tagline}
                  </p>
                </div>

                <div className="pt-2 sm:pt-3 border-t border-stone-100 dark:border-white/5 flex items-center justify-between text-[10px] sm:text-xs">
                  <div className="font-sans text-stone-500 dark:text-stone-400 truncate">
                    <span>{city.weather.condition}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[#C5A880] font-medium group-hover:translate-x-1 transition-transform duration-200 shrink-0">
                    <span className="hidden sm:inline">Explore City</span>
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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
