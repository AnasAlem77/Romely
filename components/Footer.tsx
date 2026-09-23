'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t transition-colors bg-[#FAF8F5] dark:bg-[#0A0A0C] border-stone-200 dark:border-white/10 text-stone-600 dark:text-stone-400">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-stone-200 dark:border-white/10">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <Link
              href="/"
              className="inline-block text-left font-serif text-2xl font-normal text-stone-900 dark:text-white tracking-widest hover:opacity-85 transition-opacity"
            >
              ROMELY
            </Link>
            <p className="text-xs leading-relaxed max-w-sm font-sans text-stone-600 dark:text-stone-400">
              A highly curated travel companion celebrating quality over quantity, timeless architecture, and mindful exploration.
            </p>
            <div className="text-[11px] text-[#C5A880] font-mono tracking-wider">
              Global Architectural Sanctuaries · Curated Compendium
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-[11px] uppercase tracking-widest text-[#C5A880] font-medium font-sans block">
              Directory
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/destinations"
                  className="hover:text-stone-900 dark:hover:text-white transition-colors"
                >
                  Destinations
                </Link>
              </li>
              <li>
                <Link
                  href="/sanctuaries"
                  className="hover:text-stone-900 dark:hover:text-white transition-colors"
                >
                  Sanctuaries & Places
                </Link>
              </li>
              <li>
                <Link
                  href="/top-rated"
                  className="hover:text-stone-900 dark:hover:text-white transition-colors"
                >
                  Top Rated Landmarks
                </Link>
              </li>
              <li>
                <Link
                  href="/journal"
                  className="hover:text-stone-900 dark:hover:text-white transition-colors"
                >
                  Editorial Journal
                </Link>
              </li>
            </ul>
          </div>

          {/* Editorial Philosophy */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-[11px] uppercase tracking-widest text-[#C5A880] font-medium font-sans block">
              Editorial Philosophy
            </span>
            <p className="text-xs leading-relaxed font-sans text-stone-600 dark:text-stone-400">
              Dedicated to showcasing exceptional architectural landmarks, design-forward sanctuaries, and handpicked urban experiences worldwide. Open for curated global cultural and hospitality partnerships.
            </p>
            <div className="pt-2 text-xs text-stone-400 dark:text-stone-500 font-mono">
              Global Digital Edition · 2026
            </div>
          </div>
        </div>

        {/* Bottom copyright line & Developer Attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} ROMELY. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span>Designed & Developed by</span>
            <a
              href="https://github.com/AnasAlem77"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C5A880] hover:text-[#d8bb91] hover:underline font-medium transition-colors"
            >
              Anas Alem
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
