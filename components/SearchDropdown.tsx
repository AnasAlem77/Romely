import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, CloudSun, Sparkles, X, MapPin } from 'lucide-react';
import { City } from '@/lib/types';
import { resolveSearchTarget, searchCatalog, getDestinationSummaries } from '@/lib/search';

/**
 * Reusable search dropdown component that mirrors the behavior of the homepage search.
 * It provides suggestions for matching cities and places, and shows the "Archival Curation In Progress"
 * state when there are no matches. The component is agnostic to the surrounding page layout and can be
 * used in any page that passes the full list of cities.
 */
export default function SearchDropdown({ cities }: { cities: City[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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

  const searchResults = useMemo(() => searchCatalog(cities, trimmedQuery), [cities, trimmedQuery]);
  const destinationSummaries = useMemo(() => getDestinationSummaries(cities), [cities]);

  const totalCuratedPlaces = useMemo(
    () => destinationSummaries.reduce((sum, d) => sum + d.placeCount, 0),
    [destinationSummaries]
  );

  const handleExecuteSearch = () => {
    if (!trimmedQuery) return;
    const target = resolveSearchTarget(cities, trimmedQuery);
    if (target) {
      setSearchFocused(false);
      router.push(target.kind === 'city' ? `/city/${target.cityId}` : `/place/${target.placeId}`);
    } else {
      setSearchFocused(true);
    }
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
    <div ref={searchContainerRef} className="relative z-40">
      <form onSubmit={(e) => { e.preventDefault(); handleExecuteSearch(); }} role="search" className="relative flex items-center p-1.5 sm:p-2 rounded-xl transition-all duration-200 border bg-white dark:bg-[#141417] border-stone-200 dark:border-white/10 focus-within:border-[#C5A880] focus-within:shadow-[0_8px_30px_rgba(197,168,128,0.15)] shadow-xs">
        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400 ml-2 sm:ml-3 mr-1.5 sm:mr-2 shrink-0" />
        {/* Desktop input */}
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
          className="hidden sm:block w-full min-w-0 bg-transparent px-2 py-2 text-sm focus:outline-none placeholder:text-stone-400 text-stone-900 dark:text-white"
        />
        {/* Mobile input */}
        <input
          type="text"
          value={searchQuery}
          onFocus={() => setSearchFocused(true)}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSearchFocused(true);
          }}
          placeholder="Search destinations or places..."
          aria-label="Search destinations or places"
          className="block sm:hidden w-full min-w-0 bg-transparent px-1.5 py-1.5 text-xs focus:outline-none placeholder:text-stone-400 text-stone-900 dark:text-white"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={resetSearch}
            className="p-1.5 mr-1 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-md transition-colors cursor-pointer shrink-0"
            title="Clear search"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button type="submit" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#C5A880] hover:bg-[#b89a71] text-stone-950 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 hover:shadow-xs active:scale-95 whitespace-nowrap shrink-0 cursor-pointer">
          <span>{trimmedQuery ? 'Search' : 'Explore'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="relative mt-2 w-full max-h-[min(45vh,320px)] sm:max-h-[min(50vh,380px)] lg:max-h-[min(65vh,480px)] overflow-y-auto overscroll-contain bg-[#FAF8F5] dark:bg-[#121215] border border-stone-200 dark:border-white/10 rounded-2xl shadow-2xl p-3 space-y-3 ring-1 ring-black/5 dark:ring-white/10">
          {hasMatches ? (
            <>
              {searchResults.cities.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-[#C5A880] px-3 py-1">Destinations</div>
                  {searchResults.cities.map((city) => (
                    <Link
                      key={city.id}
                      href={`/city/${city.id}`}
                      onClick={() => setSearchFocused(false)}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-stone-200/50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                        <span className="font-serif text-sm font-medium text-stone-900 dark:text-white group-hover:text-[#C5A880] transition-colors truncate">{city.name}</span>
                        <span className="text-xs text-stone-400 font-sans truncate">· {city.country}</span>
                      </div>
                      <span className="text-[11px] text-stone-400 font-mono shrink-0">{city.places.length} places</span>
                    </Link>
                  ))}
                </div>
              )}

              {searchResults.places.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-stone-200/60 dark:border-white/5">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-[#C5A880] px-3 py-1">Sanctuaries &amp; Landmarks</div>
                  {searchResults.places.map(({ place, city }) => (
                    <Link
                      key={place.id}
                      href={`/place/${place.id}`}
                      onClick={() => setSearchFocused(false)}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-stone-200/50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-8 h-8 rounded-md overflow-hidden bg-stone-800 shrink-0">
                          <Image src={place.images[0] || city.heroImage} alt={place.name} fill className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-serif text-sm font-medium text-stone-900 dark:text-white group-hover:text-[#C5A880] transition-colors block truncate">{place.name}</span>
                          <span className="text-[11px] text-stone-400 font-sans block truncate">{city.name} · {place.category}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 pl-2">
                        <span className="font-mono text-xs text-[#C5A880]">{place.rating} / 10</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Coming Soon State
            <div className="p-4 sm:p-5 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] font-sans font-medium">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Archival Curation In Progress</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-stone-900 dark:text-white font-normal break-words">“{trimmedQuery}” Coming Soon</h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 max-w-sm mx-auto leading-relaxed font-sans">
                Our curators are still vetting quiet sanctuaries in this location.
                The destinations below are already published.
              </p>
              <div className="pt-3 border-t border-stone-200/60 dark:border-white/10 space-y-3">
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                  <span className="text-stone-400 text-[11px] font-mono">Curated Now · {totalCuratedPlaces} Places:</span>
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
                  Press <span className="font-mono text-[#C5A880]">Esc</span> or click away to keep browsing.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

