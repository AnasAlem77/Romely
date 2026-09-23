'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Laptop, Bookmark, Menu, X, User } from 'lucide-react';
import { useApp } from './AppContext';

export function Navbar() {
  const pathname = usePathname();
  const {
    themeMode,
    resolvedTheme,
    cycleThemeMode,
    savedPlaceIds,
    openSavedDrawer,
  } = useApp();

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Destinations', href: '/destinations' },
    { label: 'Sanctuaries', href: '/sanctuaries' },
    { label: 'Top Rated', href: '/top-rated' },
    { label: 'Journal', href: '/journal' },
  ];

  const isLinkActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    if (href === '/destinations') {
      return pathname === '/destinations' || pathname.startsWith('/city');
    }
    if (href === '/sanctuaries') {
      return pathname === '/sanctuaries' || pathname.startsWith('/place');
    }
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-40 transition-colors duration-200 border-b bg-[#FAF8F5]/90 dark:bg-[#0A0A0C]/90 border-stone-200/80 dark:border-white/10 text-stone-900 dark:text-stone-100 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Zone 1: Brand title */}
        <div className="flex items-center">
          <Link
            href="/"
            className="group flex items-baseline gap-2.5 transition-opacity hover:opacity-85"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="font-serif text-2xl lg:text-3xl font-medium tracking-widest text-stone-900 dark:text-white">
              ROMELY
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-sans font-medium hidden sm:inline">
              Curated Guides
            </span>
          </Link>
        </div>

        {/* Zone 2: Sequential navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-all duration-200 pb-1 border-b-2 font-sans tracking-wide text-xs uppercase ${
                  active
                    ? 'border-[#C5A880] text-[#C5A880]'
                    : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:border-[#C5A880]/30'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Primary actions & Controls */}
        <div className="flex items-center gap-3">
          {/* Saved places drawer trigger */}
          <button
            onClick={openSavedDrawer}
            className="relative flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider font-medium rounded-lg transition-all duration-200 border border-stone-200 dark:border-white/10 hover:border-[#C5A880]/50 hover:bg-stone-100 dark:hover:bg-white/5 text-stone-800 dark:text-stone-200 active:scale-95 cursor-pointer"
            title="View saved itinerary"
            aria-label="View saved itinerary"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#C5A880]" />
            <span className="hidden sm:inline">Saved</span>
            {mounted && savedPlaceIds.length > 0 && (
              <span className="tabular-nums font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#C5A880] text-black font-semibold">
                {savedPlaceIds.length}
              </span>
            )}
          </button>

          {/* Theme Mode Toggle (Light / Dark / System) with SSR Hydration Guard */}
          <button
            onClick={cycleThemeMode}
            className="p-2 rounded-lg transition-all duration-200 border border-stone-200 dark:border-white/10 text-stone-700 dark:text-[#C5A880] hover:bg-stone-100 dark:hover:bg-white/5 active:scale-95 flex items-center gap-1.5 cursor-pointer min-w-[36px] min-h-[36px] justify-center"
            aria-label={mounted ? `Theme mode: ${themeMode} (Active: ${resolvedTheme}). Click to cycle.` : 'Theme toggle'}
            title={mounted ? `Theme: ${themeMode.charAt(0).toUpperCase() + themeMode.slice(1)} (Currently ${resolvedTheme}). Click to change.` : 'Theme toggle'}
          >
            {mounted ? (
              themeMode === 'system' ? (
                <Laptop className="w-4 h-4 text-[#C5A880]" />
              ) : themeMode === 'dark' ? (
                <Moon className="w-4 h-4 text-[#C5A880]" />
              ) : (
                <Sun className="w-4 h-4 text-[#B39266]" />
              )
            ) : (
              <span className="w-4 h-4 block" aria-hidden="true" />
            )}
            <span className="text-[10px] uppercase font-mono tracking-wider hidden lg:inline opacity-70">
              {mounted ? themeMode : ''}
            </span>
          </button>

          {/* Member Sign In Button */}
          <Link
            href="/sign-in"
            className={`flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider font-medium rounded-lg transition-all duration-200 border active:scale-95 cursor-pointer ${
              pathname === '/sign-in'
                ? 'border-[#C5A880] bg-[#C5A880] text-stone-950 font-semibold shadow-xs'
                : 'border-[#C5A880]/30 hover:border-[#C5A880] bg-[#C5A880]/10 hover:bg-[#C5A880]/20 text-[#C5A880]'
            }`}
            title="Member Sign In"
            aria-label="Member Sign In"
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign In</span>
          </Link>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg md:hidden border border-stone-200 dark:border-white/10 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5 active:scale-95 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 dark:border-white/10 bg-[#FAF8F5] dark:bg-[#0A0A0C] px-6 py-4 space-y-3 transition-colors">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-sm uppercase tracking-wider font-medium transition-colors ${
                  active
                    ? 'text-[#C5A880]'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-stone-200 dark:border-white/10">
            <Link
              href="/sign-in"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-sm uppercase tracking-wider font-medium text-[#C5A880]"
            >
              <User className="w-4 h-4" />
              <span>Member Sign In</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}