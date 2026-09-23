'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CloudSun,
  Sun,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Compass,
  Wind,
} from 'lucide-react';
import { City } from '@/lib/types';
import { CityClock } from './CityClock';
import { useApp } from './AppContext';

interface CityDetailProps {
  city: City;
}

export function CityDetail({ city }: CityDetailProps) {
  const { toggleSavePlace, isPlaceSaved } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isFahrenheit, setIsFahrenheit] = useState(false);

  const filteredPlaces = useMemo(() => {
    if (selectedCategory === 'All') return city.places;
    return city.places.filter((p) => p.category === selectedCategory);
  }, [city.places, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set(city.places.map((p) => p.category));
    return ['All', ...Array.from(cats)];
  }, [city.places]);

  const currentTemp = isFahrenheit ? `${city.weather.tempF}°F` : `${city.weather.tempC}°C`;

  return (
    <div className="min-h-screen pb-24">
      {/* 1. Cinematic Header */}
      <section className="relative h-[480px] sm:h-[540px] w-full overflow-hidden bg-stone-900">
        <Image
          src={city.heroImage}
          alt={city.name}
          fill
          priority
          className="object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30" />

        <div className="relative max-w-7xl mx-auto h-full px-6 flex flex-col justify-between py-10 z-10 text-white">
          <div className="flex items-center justify-between">
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-stone-300 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform text-[#C5A880]" />
              <span>Back to All Destinations</span>
            </Link>

            <div className="backdrop-blur-md bg-black/40 px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-mono">
              <CityClock timezone={city.timezone} showDate={true} />
            </div>
          </div>

          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#E6CBA3] font-medium font-sans">
              <span>{city.country}</span>
              <span aria-hidden="true">·</span>
              <span>{city.region}</span>
              <span aria-hidden="true">·</span>
              <span>{city.badge}</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-light tracking-tight text-white">
              {city.name}
            </h1>

            <p className="text-base sm:text-lg text-stone-200 font-sans leading-relaxed">
              {city.tagline}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Operational Utility Ribbon */}
      <section className="border-b bg-[#FAF8F5] dark:bg-[#0E0E12] border-stone-200 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center text-xs">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-stone-400 block">
                Local Time
              </span>
              <div className="font-mono text-sm font-medium text-stone-900 dark:text-white">
                <CityClock timezone={city.timezone} showIcon={false} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-stone-400">
                  Current Climate
                </span>
                <button
                  onClick={() => setIsFahrenheit(!isFahrenheit)}
                  className="text-[10px] text-[#C5A880] hover:underline cursor-pointer"
                >
                  {isFahrenheit ? '°C' : '°F'}
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <CloudSun className="w-4 h-4 text-[#C5A880]" />
                <span className="font-mono text-sm font-medium text-stone-900 dark:text-white">
                  {currentTemp}
                </span>
                <span className="text-stone-400 truncate font-sans text-xs">
                  · {city.weather.condition.split('&')[0]}
                </span>
              </div>
            </div>

            <div className="space-y-1 hidden sm:block">
              <span className="text-[11px] uppercase tracking-wider text-stone-400 block">
                Golden Hour
              </span>
              <div className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-[#C5A880]" />
                <span className="font-mono text-stone-800 dark:text-stone-200">
                  {city.weather.goldenHour}
                </span>
              </div>
            </div>

            <div className="space-y-1 hidden md:block">
              <span className="text-[11px] uppercase tracking-wider text-stone-400 block">
                Wind / Humidity
              </span>
              <div className="flex items-center gap-1.5 text-stone-400 font-mono">
                <Wind className="w-3.5 h-3.5" />
                <span>{city.weather.wind}</span>
                <span>·</span>
                <span>{city.weather.humidity}</span>
              </div>
            </div>

            <div className="space-y-1 hidden lg:block">
              <span className="text-[11px] uppercase tracking-wider text-stone-400 block">
                UV Index
              </span>
              <span className="font-sans text-stone-800 dark:text-stone-200">
                {city.weather.uvIndex}
              </span>
            </div>

            <div className="space-y-1 hidden lg:block text-right">
              <span className="text-[11px] uppercase tracking-wider text-stone-400 block">
                Coordinates
              </span>
              <span className="font-mono text-[11px] text-stone-400">
                {city.coordinates.lat.toFixed(2)}°N, {city.coordinates.lng.toFixed(2)}°E
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-6 pt-12 space-y-16">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-sans font-medium">
              Curator’s Monograph
            </span>
            <p className="text-lg sm:text-xl font-serif font-light leading-relaxed first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 text-stone-800 dark:text-stone-200">
              {city.editorialDescription}
            </p>
          </div>

          <div className="lg:col-span-4 p-6 rounded-2xl border space-y-4 bg-white dark:bg-[#121215] border-stone-200 dark:border-white/10 shadow-xs">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A880] font-medium font-sans">
              <Compass className="w-3.5 h-3.5" />
              <span>Curation Criteria</span>
            </div>
            <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">
              Every place in this guide is vetted in person by our architectural contributors. We reward tranquil acoustics, tactile natural materials, authentic lineage, and hospitality that values discretion over spectacle.
            </p>
            <div className="pt-2 border-t border-stone-100 dark:border-white/5 text-[11px] text-stone-400 flex items-center justify-between">
              <span>{city.places.length} places vetted</span>
              <span>Updated Autumn 2026</span>
            </div>
          </div>
        </section>

        {/* 3. Insider Tips */}
        <section className="rounded-2xl p-8 sm:p-10 border relative overflow-hidden bg-gradient-to-br from-[#FAF8F5] to-[#F3EFE7] dark:from-[#141418] dark:to-[#0E0E12] border-stone-200 dark:border-white/10 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200/60 dark:border-white/10">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest text-[#C5A880] font-sans font-medium flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Insider Knowledge
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 dark:text-white">
                Dispatches from {city.name} Correspondents
              </h2>
            </div>
            <span className="text-xs text-stone-500 font-sans">
              Etiquette, unmapped portals, and optimal timing
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {city.insiderTips.map((tip) => (
              <div
                key={tip.id}
                className="p-6 rounded-xl border flex flex-col justify-between space-y-4 bg-white/80 dark:bg-[#1A1A20]/60 border-stone-200/80 dark:border-white/5 shadow-xs"
              >
                <div className="space-y-2">
                  <span className="text-[11px] uppercase tracking-wider text-[#C5A880] font-sans font-medium">
                    {tip.category}
                  </span>
                  <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-white">
                    {tip.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                    {tip.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-200/50 dark:border-white/5 text-[11px] text-stone-400">
                  <span className="font-medium text-stone-700 dark:text-stone-300">{tip.curatorName}</span>
                  <span className="block text-[10px] text-stone-400">{tip.curatorRole}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Curated Places */}
        <section id="places" className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200 dark:border-white/10">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#C5A880] font-sans font-medium block mb-1">
                Curated Index
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 dark:text-white">
                Curated Places in {city.name}
              </h2>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl border overflow-x-auto max-w-full bg-stone-100 dark:bg-[#141417] border-stone-200 dark:border-white/10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-white dark:bg-[#222228] text-stone-900 dark:text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlaces.map((place) => {
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
                      <span className="backdrop-blur-md bg-black/40 px-2.5 py-1 rounded text-xs font-mono text-white border border-white/15">
                        {place.rating} / 10
                      </span>
                    </div>

                    <Link
                      href={`/place/${place.id}`}
                      className="absolute bottom-4 left-4 right-4 text-white block"
                    >
                      <div className="text-[11px] uppercase tracking-wider text-[#E6CBA3] font-medium font-sans">
                        {place.category} · {place.neighborhood}
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
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredPlaces.length === 0 && (
            <div className="py-16 text-center space-y-2">
              <p className="font-serif text-xl text-stone-500">No places in this category yet.</p>
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-xs text-[#C5A880] hover:underline cursor-pointer"
              >
                View all places
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
