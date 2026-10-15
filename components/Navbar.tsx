'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Laptop, Bookmark, Menu, X, User } from 'lucide-react';
import { useApp } from './AppContext';

const emptySubscribe = () => () => {};

export function Navbar() {
  const pathname = usePathname();
  const {
    themeMode,
    resolvedTheme,
    cycleThemeMode,
    savedPlaceIds,
    openSavedDrawer,
  } = useApp();

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Destinations', href: '/destinations' },
    { label: 'Sanctuaries', href: '/sanctuaries' },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Zone 1: Brand title */}
        <div className="flex items-center">
          <Link
            href="/"
            className="group flex items-baseline gap-2 sm:gap-2.5 transition-opacity hover:opacity-85"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="font-serif text-xl sm:text-2xl lg:text-3xl font-medium tracking-wider sm:tracking-widest text-stone-900 dark:text-white">
              ROMELY
            </span>
            <span className="text-[10px] uppercase tracking-wider sm:tracking-widest text-[#C5A880] font-sans font-medium hidden sm:inline">
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
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Saved places drawer trigger */}
            <Link
              href="/saved"
              prefetch={false}
              className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs uppercase tracking-wider font-medium rounded-lg transition-all duration-200 border border-stone-200 dark:border-white/10 hover:border-[#C5A880]/50 hover:bg-stone-100 dark:hover:bg-white/5 text-stone-800 dark:text-stone-200 active:scale-95 cursor-pointer hidden md:flex"
              title="View saved itinerary"
              aria-label="View saved itinerary"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="hidden sm:inline">Saved</span>
              {mounted && savedPlaceIds.length > 0 && (
                <span className="tabular-nums font-mono text-[10px] sm:text-[11px] px-1 sm:px-1.5 py-0.5 rounded bg-[#C5A880] text-black font-semibold">
                  {savedPlaceIds.length}
                </span>
              )}
            </Link>

          {/* Theme Mode Toggle (Light / Dark / System) with SSR Hydration Guard */}
          <button
            onClick={cycleThemeMode}
            className="p-1.5 sm:p-2 rounded-lg transition-all duration-200 border border-stone-200 dark:border-white/10 text-stone-700 dark:text-[#C5A880] hover:bg-stone-100 dark:hover:bg-white/5 active:scale-95 flex items-center gap-1.5 cursor-pointer min-w-[32px] sm:min-w-[36px] min-h-[32px] sm:min-h-[36px] justify-center"
            aria-label={mounted ? `Theme mode: ${themeMode} (Active: ${resolvedTheme}). Click to cycle.` : 'Theme toggle'}
            title={mounted ? `Theme: ${themeMode.charAt(0).toUpperCase() + themeMode.slice(1)} (Currently ${resolvedTheme}). Click to change.` : 'Theme toggle'}
          >
            {mounted ? (
              themeMode === 'system' ? (
                <Laptop className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5A880]" />
              ) : themeMode === 'dark' ? (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5A880]" />
              ) : (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B39266]" />
              )
            ) : (
              <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 block" aria-hidden="true" />
            )}
            <span className="text-[10px] uppercase font-mono tracking-wider hidden lg:inline opacity-70">
              {mounted ? themeMode : ''}
            </span>
          </button>

          {/* Member Sign In Button */}
          {pathname !== '/sign-in' && (
            <Link
              href="/sign-in"
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs uppercase tracking-wider font-medium rounded-lg transition-all duration-200 border active:scale-95 cursor-pointer ${
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
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg md:hidden border border-stone-200 dark:border-white/10 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5 active:scale-95 cursor-pointer min-h-9 min-w-9"
            aria-label={mobileMenuOpen ? 'Close utility menu' : 'Open utility menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile utility menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-50 md:hidden sm:top-20" role="dialog" aria-modal="true" aria-label="Romely utility menu">
          <button type="button" aria-label="Close utility menu" className="absolute inset-0 bg-stone-950/20 backdrop-blur-[1px] dark:bg-black/45 motion-safe:animate-[romely-veil_180ms_ease-out]" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-3 top-3 max-h-[calc(100dvh-5.5rem)] w-[min(22rem,calc(100%-1.5rem))] overflow-y-auto rounded-2xl border border-stone-200/90 bg-[#FAF8F5] p-2.5 shadow-[0_18px_50px_rgba(28,25,23,0.2)] motion-safe:animate-[romely-rise_180ms_ease-out] dark:border-white/10 dark:bg-[#121215] dark:shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
            <div className="border-b border-stone-200 px-3 pb-3 pt-2 dark:border-white/10">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#9A743E] dark:text-[#C5A880]">Romely</p>
              <p className="mt-1 font-serif text-lg text-stone-900 dark:text-white">Edition &amp; assistance</p>
            </div>
            <nav className="py-2" aria-label="Utility navigation">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Use', href: '/terms' },
                { label: 'FAQ', href: '/faq' },
              ].map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium tracking-wide text-stone-700 transition-colors hover:bg-stone-200/70 hover:text-stone-950 dark:text-stone-300 dark:hover:bg-white/5 dark:hover:text-white">
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-stone-200 px-3 pb-1 pt-3 dark:border-white/10">
              <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 rounded-xl py-2 text-sm font-medium tracking-wide text-[#9A743E] dark:text-[#C5A880]">
                <User className="h-4 w-4" />
                <span>Member Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
