'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, CloudSun, MapPin, Sparkles, X, Star } from 'lucide-react';
import { City } from '@/lib/types';
import {
  cityHasMatchingPlaces,
  cityMatchesQuery,
  getDestinationSummaries,
  resolveSearchTarget,
  searchCatalog,
} from '@/lib/search';
import { CityClock } from './CityClock';

interface ExploreHomeProps {
  cities: City[];
}

export function ExploreHome({ cities }: ExploreHomeProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<'All' | 'Europe' | 'Asia' | 'Mediterranean'>('All');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const trimmedQuery = searchQuery.trim();

  const filteredCities = useMemo(() => {
    return cities.filter((city) => {
      const matchesRegion = selectedRegion === 'All' || city.region === selectedRegion;
      if (!trimmedQuery) return matchesRegion;
      return (
        matchesRegion &&
        (cityMatchesQuery(city, trimmedQuery) || cityHasMatchingPlaces(city, trimmedQuery))
      );
    });
  }, [cities, selectedRegion, trimmedQuery]);

  const searchResults = useMemo(
    () => searchCatalog(cities, trimmedQuery),
    [cities, trimmedQuery]
  );

  const destinationSummaries = useMemo(() => getDestinationSummaries(cities), [cities]);

  const totalCuratedPlaces = useMemo(
    () => destinationSummaries.reduce((sum, destination) => sum + destination.placeCount, 0),
    [destinationSummaries]
  );

  // Execute search on Enter key or on the submit button. Resolves the query to a
  // real catalogue entry and routes to its dynamic page; when nothing matches, the
  // panel stays open so the "Coming Soon" curation card can be shown instead of
  // navigating to a route that does not exist.
  const handleExecuteSearch = () => {
    if (!trimmedQuery) {
      const el = document.getElementById('destinations');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const target = resolveSearchTarget(cities, trimmedQuery);
    if (target) {
      setSearchFocused(false);
      router.push(target.kind === 'city' ? `/city/${target.cityId}` : `/place/${target.placeId}`);
      return;
    }

    setSearchFocused(true);
  };

  // Enter is handled twice on purpose: the keydown guard routes immediately, and
  // the surrounding <form> submit catches Enter from any path that bypasses the
  // handler (IME composition, assistive tech, autofill). preventDefault keeps the
  // two paths from ever firing together.
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleExecuteSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecuteSearch();
    } else if (e.key === 'Escape') {
      setSearchFocused(false);
    }
  };

  const resetSearch = () => {
    setSearchQuery('');
    setSearchFocused(false);
  };

  const showSuggestions = searchFocused && trimmedQuery.length > 0;
  const hasMatches = searchResults.hasMatches;

  return (
    <div className="min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] -z-10 opacity-25 blur-3xl pointer-events-none bg-[#C5A880]/15 dark:bg-[#C5A880]/10" />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] font-sans font-medium">
                  <span>Global Edition</span>
                  <span aria-hidden="true">·</span>
                  <span>Autumn 2026</span>
                  <span aria-hidden="true">·</span>
                  <span>Architectural Compendium</span>
                </div>

                <h1
                  className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight leading-[1.1] text-stone-900 dark:text-white"
                  style={{ textWrap: 'balance' }}
                >
                  The Art of Slow, Evocative Travel
                </h1>

                <p className="text-base lg:text-lg leading-relaxed font-sans max-w-xl text-stone-600 dark:text-stone-300">
                  A minimalist compendium of the world’s quietest courtyards, heritage kissatens, and architectural sanctuaries. Curated for the discerning traveler who values atmosphere over itineraries.
                </p>
              </div>

              {/* Minimalist Search Bar with Live Suggestions Dropdown & Enter Key Support */}
              <div ref={searchContainerRef} className="relative z-30">
                <form
                  onSubmit={handleFormSubmit}
                  role="search"
                  className="relative flex items-center p-2 rounded-xl transition-all duration-200 border bg-white dark:bg-[#141417] border-stone-200 dark:border-white/10 focus-within:border-[#C5A880] focus-within:shadow-[0_8px_30px_rgba(197,168,128,0.15)] shadow-xs"
                >
                  <Search className="w-5 h-5 text-stone-400 ml-3 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setSearchFocused(true)}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchFocused(true);
                    }}
                    placeholder="Search by city, cafe, museum, or architecture..."
                    aria-label="Search by city, cafe, museum, or architecture"
                    className="w-full bg-transparent px-2 py-2 text-sm focus:outline-none placeholder:text-stone-400 text-stone-900 dark:text-white"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1.5 mr-1 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-md transition-colors cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#C5A880] hover:bg-[#b89a71] text-stone-950 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 hover:shadow-xs active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>{searchQuery.trim() ? 'Search' : 'Explore'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Instant Search Suggestions Popover or "Coming Soon" State */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 max-h-[min(70vh,540px)] overflow-y-auto overscroll-contain bg-[#FAF8F5] dark:bg-[#121215] border border-stone-200 dark:border-white/10 rounded-2xl shadow-2xl p-3 space-y-3 z-50 backdrop-blur-md">
                    {hasMatches ? (
                      <>
                        {searchResults.cities.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-[10px] uppercase font-mono tracking-widest text-[#C5A880] px-3 py-1">
                              Destinations
                            </div>
                            {searchResults.cities.map((city) => (
                              <Link
                                key={city.id}
                                href={`/city/${city.id}`}
                                onClick={() => setSearchFocused(false)}
                                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-stone-200/50 dark:hover:bg-white/5 transition-colors group"
                              >
                                <div className="flex items-center gap-2.5">
                                  <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                                  <span className="font-serif text-sm font-medium text-stone-900 dark:text-white group-hover:text-[#C5A880] transition-colors">
                                    {city.name}
                                  </span>
                                  <span className="text-xs text-stone-400 font-sans">
                                    · {city.country}
                                  </span>
                                </div>
                                <span className="text-[11px] text-stone-400 font-mono">
                                  {city.places.length} places
                                </span>
                              </Link>
                            ))}
                          </div>
                        )}

                        {searchResults.places.length > 0 && (
                          <div className="space-y-1 pt-1 border-t border-stone-200/60 dark:border-white/5">
                            <div className="text-[10px] uppercase font-mono tracking-widest text-[#C5A880] px-3 py-1">
                              Sanctuaries & Landmarks
                            </div>
                            {searchResults.places.map(({ place, city }) => (
                              <Link
                                key={place.id}
                                href={`/place/${place.id}`}
                                onClick={() => setSearchFocused(false)}
                                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-stone-200/50 dark:hover:bg-white/5 transition-colors group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="relative w-8 h-8 rounded-md overflow-hidden bg-stone-800 shrink-0">
                                    <Image
                                      src={place.images[0] || city.heroImage}
                                      alt={place.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="truncate">
                                    <span className="font-serif text-sm font-medium text-stone-900 dark:text-white group-hover:text-[#C5A880] transition-colors block truncate">
                                      {place.name}
                                    </span>
                                    <span className="text-[11px] text-stone-400 font-sans block truncate">
                                      {city.name} · {place.category}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right shrink-0 pl-2">
                                  <span className="font-mono text-xs text-[#C5A880]">
                                    {place.rating} / 10
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      /* Luxury "Coming Soon" Card */
                      <div className="p-5 text-center space-y-3">
                        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] font-sans font-medium">
                          <Sparkles className="w-4 h-4" />
                          <span>Archival Curation In Progress</span>
                        </div>
                        <h3 className="font-serif text-xl sm:text-2xl text-stone-900 dark:text-white font-normal">
                          &ldquo;{searchQuery.trim()}&rdquo; Coming Soon
                        </h3>
                        <p className="text-xs text-stone-600 dark:text-stone-400 max-w-sm mx-auto leading-relaxed font-sans">
                          Our curators are still vetting quiet sanctuaries in this location. The
                          destinations below are already published.
                        </p>
                        <div className="pt-3 border-t border-stone-200/60 dark:border-white/10 space-y-3">
                          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                            <span className="text-stone-400 text-[11px] font-mono">
                              Curated Now · {totalCuratedPlaces} Places:
                            </span>
                            {destinationSummaries.map((destination) => (
                              <Link
                                key={destination.id}
                                href={`/city/${destination.id}`}
                                onClick={resetSearch}
                                className="px-2.5 py-1 rounded-md bg-stone-200/60 dark:bg-white/10 text-stone-800 dark:text-stone-200 hover:text-[#C5A880] transition-colors font-medium"
                              >
                                {destination.name} ({destination.placeCount})
                              </Link>
                            ))}
                          </div>
                          <p className="text-[11px] text-stone-400 font-sans">
                            Press <span className="font-mono text-[#C5A880]">Esc</span> or click away to keep
                            browsing.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-stone-500">
                <span className="text-[#C5A880] font-medium">Currently Curating:</span>
                {destinationSummaries.map((destination, index) => (
                  <React.Fragment key={destination.id}>
                    {index > 0 && (
                      <span aria-hidden="true" className="opacity-40">
                        ·
                      </span>
                    )}
                    <span>
                      {destination.name} ({destination.placeCount})
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <Link
                href="/city/paris"
                className="group relative h-[380px] sm:h-[460px] w-full rounded-2xl overflow-hidden block shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] border border-stone-200/60 dark:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(197,168,128,0.16)]"
              >
                <div className="absolute inset-0 bg-stone-800" />
                <Image
                  src="/images/hero_paris.jpg"
                  alt="Parisian Haussmann facades along the Seine at golden hour"
                  fill
                  priority
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

                <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
                  <div className="flex items-center justify-between">
                    <div className="text-xs uppercase tracking-widest text-[#E6CBA3] font-medium">
                      Editor’s Seasonal Selection
                    </div>
                    <div className="backdrop-blur-md bg-black/40 px-3 py-1 rounded-full text-xs font-mono border border-white/15">
                      <CityClock timezone="Europe/Paris" showIcon={false} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs tracking-wider text-stone-300 font-sans uppercase">
                      France · Europe
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif font-light tracking-tight text-white group-hover:text-[#E6CBA3] transition-colors">
                      Paris: The Haussmann Reverie
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-300 line-clamp-2 max-w-md font-sans">
                      From quiet reading tables at Café de Flore to Monet’s elliptical water lilies at the Orangerie.
                    </p>

                    <div className="pt-2 flex items-center gap-2 text-xs font-medium text-[#E6CBA3] group-hover:translate-x-1.5 transition-transform duration-200">
                      <span>Explore Paris City Monograph</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Curated Cities Directory */}
      <section id="destinations" className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-stone-200 dark:border-white/10">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-sans font-medium block mb-2">
              The Compendium
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-normal text-stone-900 dark:text-white">
              Curated Destinations
            </h2>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl border bg-stone-100 dark:bg-[#141417] border-stone-200 dark:border-white/10">
            {(['All', 'Europe', 'Asia', 'Mediterranean'] as const).map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  selectedRegion === region
                    ? 'bg-white dark:bg-[#202026] text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {trimmedQuery && (
          <div className="pt-4 text-xs text-stone-500">
            Showing {filteredCities.length} {filteredCities.length === 1 ? 'destination' : 'destinations'} matching &ldquo;{trimmedQuery}&rdquo;
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
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
                    <span>View Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredCities.length === 0 && (
          <div className="py-20 text-center space-y-4">
            {trimmedQuery ? (
              <>
                <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] font-sans font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>Archival Curation In Progress</span>
                </div>
                <p className="font-serif text-2xl sm:text-3xl text-stone-900 dark:text-white">
                  &ldquo;{trimmedQuery}&rdquo; Coming Soon
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed font-sans">
                  Our architectural curators are still vetting monographs for this location. The
                  destinations below are already in the compendium.
                </p>
              </>
            ) : (
              <p className="font-serif text-2xl text-stone-500">
                No destinations curated in this region yet.
              </p>
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
              onClick={() => {
                resetSearch();
                setSelectedRegion('All');
              }}
              className="text-xs uppercase tracking-wider text-[#C5A880] hover:underline cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>

      {/* 3. Editorial Curatorial Manifesto */}
      <section className="my-16 py-20 border-y bg-[#F5F2EC] dark:bg-[#0E0E12] border-stone-200 dark:border-white/10 transition-colors">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <span className="text-xs uppercase tracking-widest text-[#C5A880] font-sans font-medium">
            The ROMELY Philosophy
          </span>

          <blockquote className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal leading-relaxed text-stone-900 dark:text-stone-100">
            &ldquo;Travel is not a checklist of sights consumed, but a cadence of quiet observation—the light falling across an ancient stone lintel, the fragrance of steamed sencha, the pause between footsteps.&rdquo;
          </blockquote>

          <div className="pt-4 flex items-center justify-center gap-3 text-xs text-stone-500">
            <span className="font-medium text-stone-700 dark:text-stone-300">Jean-Baptiste Laurent</span>
            <span aria-hidden="true">·</span>
            <span>Founding Curator, ROMELY</span>
          </div>
        </div>
      </section>

      {/* 4. Curators' Spotlights */}
      <section id="sanctuaries-preview" className="max-w-7xl mx-auto px-6 py-12 mb-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-stone-200 dark:border-white/10">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-sans font-medium block mb-1">
              Curator’s Notebook
            </span>
            <h2 className="text-3xl font-serif text-stone-900 dark:text-white">
              Places of Quiet Distinction
            </h2>
          </div>
          <Link
            href="/sanctuaries"
            className="text-xs text-[#C5A880] hover:underline flex items-center gap-1 font-medium font-sans"
          >
            <span>View All Sanctuaries</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          {cities
            .flatMap((c) => c.places.slice(0, 1).map((p) => ({ place: p, city: c })))
            .slice(0, 3)
            .map(({ place, city }) => (
              <Link
                key={place.id}
                href={`/place/${place.id}`}
                className="group rounded-2xl overflow-hidden border p-5 transition-all duration-300 bg-white dark:bg-[#121215] border-stone-200 dark:border-white/10 hover:border-[#C5A880]/60 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(197,168,128,0.12)] cursor-pointer block"
              >
                <div className="relative h-48 w-full rounded-xl overflow-hidden mb-4 bg-stone-800">
                  <Image
                    src={place.images[0] || city.heroImage}
                    alt={place.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded text-[11px] text-white font-mono flex items-center gap-1">
                    <Star className="w-3 h-3 text-[#C5A880] fill-[#C5A880]" />
                    <span>{place.rating} / 10</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span>{city.name} · {place.neighborhood}</span>
                    <span className="text-[#C5A880] font-mono">{place.priceLevel}</span>
                  </div>

                  <h3 className="text-xl font-serif font-medium group-hover:text-[#C5A880] transition-colors text-stone-900 dark:text-white">
                    {place.name}
                  </h3>

                  <p className="text-xs leading-relaxed line-clamp-2 text-stone-600 dark:text-stone-400">
                    {place.tagline}
                  </p>
                </div>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
