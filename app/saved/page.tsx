'use client';

import { useApp } from '@/components/AppContext';
import { SavedPlaceCard } from '@/components/SavedPlaceCard';
import Link from 'next/link';

/**
 * /saved route - displays all saved places in a responsive grid.
 */
export default function SavedPage() {
  const { savedPlacesWithCity } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-serif text-3xl font-medium mb-4">Saved Places</h1>
      <p className="text-sm text-stone-500 mb-6">
        {savedPlacesWithCity.length} place{savedPlacesWithCity.length !== 1 ? 's' : ''} saved.
      </p>

      {savedPlacesWithCity.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <p className="font-serif text-lg text-stone-500 mb-2">Your itinerary is empty.</p>
          <p className="text-xs text-stone-400 max-w-xs">
            Explore destinations and click the bookmark icon to curate your personal journey.
          </p>
          <Link
            href="/destinations"
            className="mt-4 text-sm text-[#C5A880] hover:underline"
          >
            Browse Destinations
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {savedPlacesWithCity.map(({ place, city }) => (
            <SavedPlaceCard key={place.id} place={place} city={city} />
          ))}
        </div>
      )}
    </div>
  );
}
