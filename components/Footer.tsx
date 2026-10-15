'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  if (pathname !== '/') return null;

  return (
    <footer className="border-t transition-colors bg-[#FAF8F5] dark:bg-[#0A0A0C] border-stone-200 dark:border-white/10 text-stone-600 dark:text-stone-400 pb-20 md:pb-6">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6 sm:py-10">
        
        {/* Mobile View: Centered & Compact (Hidden on Desktop) */}
        <div className="block md:hidden text-center space-y-5 pb-6 border-b border-stone-200 dark:border-white/10">
          <div className="space-y-1.5">
            <Link
              href="/"
              className="inline-block font-serif text-2xl font-normal text-stone-900 dark:text-white tracking-[0.2em]"
            >
              ROMELY
            </Link>
            <p className="text-xs leading-relaxed max-w-xs mx-auto font-sans text-stone-600 dark:text-stone-400">
              A highly curated travel companion celebrating quality over quantity, timeless architecture, and mindful exploration.
            </p>
            <div className="text-[11px] text-[#9A743E] dark:text-[#C5A880] font-mono tracking-wider pt-0.5">
              Global Architectural Sanctuaries · Curated Compendium
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] uppercase tracking-widest text-[#9A743E] dark:text-[#C5A880] font-medium block">
              Directory
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
              <Link href="/destinations" className="hover:text-stone-900 dark:hover:text-white transition-colors">
                Destinations
              </Link>
              <span className="text-stone-300 dark:text-stone-700">/</span>
              <Link href="/sanctuaries" className="hover:text-stone-900 dark:hover:text-white transition-colors">
                Sanctuaries & Places
              </Link>
              <span className="text-stone-300 dark:text-stone-700">/</span>
              <Link href="/journal" className="hover:text-stone-900 dark:hover:text-white transition-colors">
                Editorial Journal
              </Link>
            </div>
          </div>

          <div className="space-y-1.5 max-w-xs mx-auto">
            <span className="text-[11px] uppercase tracking-widest text-[#9A743E] dark:text-[#C5A880] font-medium block">
              Editorial Philosophy
            </span>
            <p className="text-xs leading-relaxed font-sans text-stone-600 dark:text-stone-400">
              Dedicated to showcasing exceptional architectural landmarks, design-forward sanctuaries, and handpicked urban experiences worldwide.
            </p>
          </div>
        </div>

        {/* Desktop View: Adjusted Grid Spans for Perfect Spacing (Hidden on Mobile) */}
        <div className="hidden md:grid grid-cols-12 gap-8 lg:gap-12 pb-8 border-b border-stone-200 dark:border-white/10 items-start">
          
          {/* 1. ROMELY Brand & Intro (Wider Column) */}
          <div className="col-span-4 space-y-3">
            <Link
              href="/"
              className="inline-block font-serif text-2xl font-normal text-stone-900 dark:text-white tracking-widest hover:opacity-85 transition-opacity"
            >
              ROMELY
            </Link>
            <p className="text-xs leading-relaxed font-sans text-stone-600 dark:text-stone-400 pr-4">
              A highly curated travel companion celebrating quality over quantity, timeless architecture, and mindful exploration.
            </p>
            <div className="text-[11px] text-[#9A743E] dark:text-[#C5A880] font-mono tracking-wider">
              Global Architectural Sanctuaries · Curated Compendium
            </div>
          </div>

          {/* 2. Romely Links (About, Contact, etc.) */}
          <div className="col-span-2 space-y-2.5">
            <span className="block text-[11px] font-medium uppercase tracking-widest text-[#9A743E] dark:text-[#C5A880]">
              Romely
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/about" className="transition-colors hover:text-stone-900 dark:hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-stone-900 dark:hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-stone-900 dark:hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-stone-900 dark:hover:text-white">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/faq" className="transition-colors hover:text-stone-900 dark:hover:text-white">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Editorial Philosophy */}
          <div className="col-span-3 space-y-2.5">
            <span className="text-[11px] uppercase tracking-widest text-[#9A743E] dark:text-[#C5A880] font-medium font-sans block">
              Editorial Philosophy
            </span>
            <p className="text-xs leading-relaxed font-sans text-stone-600 dark:text-stone-400">
              Dedicated to showcasing exceptional architectural landmarks, design-forward sanctuaries, and handpicked urban experiences worldwide. Open for curated global cultural and hospitality partnerships.
            </p>
          </div>

          {/* 4. Directory */}
          <div className="col-span-3 space-y-2.5">
            <span className="text-[11px] uppercase tracking-widest text-[#9A743E] dark:text-[#C5A880] font-medium font-sans block">
              Directory
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/destinations" className="hover:text-stone-900 dark:hover:text-white transition-colors">
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/sanctuaries" className="hover:text-stone-900 dark:hover:text-white transition-colors">
                  Sanctuaries & Places
                </Link>
              </li>
              <li>
                <Link href="/journal" className="hover:text-stone-900 dark:hover:text-white transition-colors">
                  Editorial Journal
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="flex flex-col items-center gap-1 pt-4 text-center text-xs text-stone-500">
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} ROMELY. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1">
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