'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ArrowRight, BookmarkCheck } from 'lucide-react';
import { useApp } from '@/components/AppContext';

/**
 * Reusable card component for a saved place.
 * Mirrors the markup used in SavedDrawer for consistency.
 */
export function SavedPlaceCard({
  place,
  city,
}: {
  place: {
    id: string;
    name: string;
    category: string;
    rating: number;
    images: string[];
    coordinates: { lat: number; lng: number };
  };
  city: { name: string; heroImage: string };
}) {
  const { toggleSavePlace, closeSavedDrawer } = useApp();

  return (
    <div className="group p-4 rounded-xl border transition-all duration-200 flex items-start gap-4 bg-white dark:bg-[#141418] border-stone-200 dark:border-white/10 shadow-xs hover:border-[#C5A880]/50">
      <Link
        href={`/place/${place.id}`}
        className="relative h-18 w-20 rounded-lg overflow-hidden shrink-0 cursor-pointer bg-stone-800 block"
        onClick={() => {
          // In drawer context we close the drawer, otherwise it's a no‑op.
          if (closeSavedDrawer) closeSavedDrawer();
        }}
      >
        <Image
          src={place.images[0] || city.heroImage}
          alt={place.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
      </Link>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between text-[11px] text-stone-400">
          <span>{city.name} · {place.category}</span>
          <button
            onClick={() => toggleSavePlace(place.id)}
            className="text-stone-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
            title="Remove from saved"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <Link
          href={`/place/${place.id}`}
          className="font-serif text-base font-medium truncate block hover:text-[#C5A880] transition-colors"
        >
          {place.name}
        </Link>
        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="font-mono text-[#C5A880] text-[11px]">{place.rating} / 10</span>
          <Link
            href={`/place/${place.id}`}
            className="text-xs text-[#C5A880] hover:underline flex items-center gap-1 font-medium"
          >
            <span>View</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

