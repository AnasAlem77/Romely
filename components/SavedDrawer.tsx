'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Trash2, ArrowRight, BookmarkCheck, ExternalLink, MapPin } from 'lucide-react';
import { useApp } from './AppContext';

export function SavedDrawer() {
  const {
    isSavedDrawerOpen,
    closeSavedDrawer,
    savedPlacesWithCity,
    toggleSavePlace,
  } = useApp();

  if (!isSavedDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeSavedDrawer}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md flex flex-col justify-between shadow-2xl border-l transition-all bg-[#FAF8F5] dark:bg-[#0E0E12] border-stone-200 dark:border-white/10 text-stone-900 dark:text-stone-100">
          {/* Header */}
          <div className="p-6 border-b border-stone-200 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-[#C5A880]" />
              <h2 className="font-serif text-xl font-medium">Curated Itinerary</h2>
              <span className="text-xs font-mono text-stone-400">({savedPlacesWithCity.length})</span>
            </div>

            <button
              onClick={closeSavedDrawer}
              className="p-2 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close itinerary drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of saved places */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {savedPlacesWithCity.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
                <BookmarkCheck className="w-10 h-10 text-stone-300 dark:text-stone-700" />
                <p className="font-serif text-lg text-stone-500">Your itinerary is currently empty.</p>
                <p className="text-xs text-stone-400 max-w-xs leading-relaxed font-sans">
                  While exploring cities and sanctuaries, click the bookmark icon on any place to curate your personal journey.
                </p>
              </div>
            ) : (
              savedPlacesWithCity.map(({ place, city }) => (
                <div
                  key={place.id}
                  className="group p-4 rounded-xl border transition-all duration-200 flex items-start gap-4 bg-white dark:bg-[#141418] border-stone-200 dark:border-white/10 shadow-xs hover:border-[#C5A880]/50"
                >
                  <Link
                    href={`/place/${place.id}`}
                    onClick={closeSavedDrawer}
                    className="relative h-18 w-20 rounded-lg overflow-hidden shrink-0 cursor-pointer bg-stone-800 block"
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
                      onClick={closeSavedDrawer}
                      className="font-serif text-base font-medium truncate block hover:text-[#C5A880] transition-colors"
                    >
                      {place.name}
                    </Link>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="font-mono text-[#C5A880] text-[11px]">{place.rating} / 10</span>
                      <Link
                        href={`/place/${place.id}`}
                        onClick={closeSavedDrawer}
                        className="text-xs text-[#C5A880] hover:underline flex items-center gap-1 font-medium"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer action */}
          {savedPlacesWithCity.length > 0 && (
            <div className="p-6 border-t border-stone-200 dark:border-white/10 space-y-2">
              <a
                href={`https://www.google.com/maps/dir/${savedPlacesWithCity
                  .map((sp) => `${sp.place.coordinates.lat},${sp.place.coordinates.lng}`)
                  .join('/')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#C5A880] hover:bg-[#b5966d] text-stone-950 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-xs"
              >
                <MapPin className="w-4 h-4" />
                <span>Map Full Itinerary</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <p className="text-[11px] text-stone-400 text-center">
                Generates a multi-stop itinerary on Google Maps.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
