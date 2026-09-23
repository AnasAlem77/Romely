'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useSyncExternalStore, ReactNode } from 'react';
import { CITIES_DATA } from '@/lib/travelData';
import { City, Place } from '@/lib/types';

export type ThemeMode = 'system' | 'dark' | 'light';

interface AppContextType {
  themeMode: ThemeMode;
  resolvedTheme: 'dark' | 'light';
  setThemeMode: (mode: ThemeMode) => void;
  cycleThemeMode: () => void;
  savedPlaceIds: string[];
  toggleSavePlace: (placeId: string) => void;
  isPlaceSaved: (placeId: string) => boolean;
  savedPlacesWithCity: { place: Place; city: City }[];
  isSavedDrawerOpen: boolean;
  setIsSavedDrawerOpen: (open: boolean) => void;
  openSavedDrawer: () => void;
  closeSavedDrawer: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Subscription for system color scheme changes
function subscribeToSystemTheme(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

function getSystemThemeSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getSystemThemeServerSnapshot(): boolean {
  return false;
}

export function AppContextProvider({ children }: { children: ReactNode }) {
  // Read system dark preference via useSyncExternalStore (React 19 standard)
  const isSystemDark = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemThemeSnapshot,
    getSystemThemeServerSnapshot
  );

  // Theme mode: initialized from localStorage or defaults to 'system'
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'system';
    try {
      const stored = localStorage.getItem('romely_theme') || localStorage.getItem('edition_voyage_theme');
      if (stored === 'dark' || stored === 'light' || stored === 'system') {
        return stored as ThemeMode;
      }
    } catch {}
    return 'system';
  });

  // Saved place IDs: initialized from localStorage or defaults to initial favorites
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ['paris-cafe-de-flore', 'tokyo-nezu-museum'];
    try {
      const stored = localStorage.getItem('romely_saved') || localStorage.getItem('edition_voyage_saved');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return ['paris-cafe-de-flore', 'tokyo-nezu-museum'];
  });

  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState<boolean>(false);

  // Compute resolved theme
  const resolvedTheme: 'dark' | 'light' = useMemo(() => {
    if (themeMode === 'system') {
      return isSystemDark ? 'dark' : 'light';
    }
    return themeMode;
  }, [themeMode, isSystemDark]);

  // Synchronize <html> root class & colorScheme with resolvedTheme
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [resolvedTheme]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem('romely_theme', mode);
    } catch {}
  };

  const cycleThemeMode = () => {
    const nextMode: Record<ThemeMode, ThemeMode> = {
      light: 'dark',
      dark: 'system',
      system: 'light',
    };
    setThemeMode(nextMode[themeMode]);
  };

  const toggleSavePlace = (placeId: string) => {
    setSavedPlaceIds((prev) => {
      const exists = prev.includes(placeId);
      const next = exists ? prev.filter((id) => id !== placeId) : [...prev, placeId];
      try {
        localStorage.setItem('romely_saved', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const isPlaceSaved = (placeId: string) => savedPlaceIds.includes(placeId);

  // Saved places array with respective city details
  const savedPlacesWithCity = useMemo(() => {
    const list: { place: Place; city: City }[] = [];
    savedPlaceIds.forEach((id) => {
      for (const city of CITIES_DATA) {
        const p = city.places.find((item) => item.id === id);
        if (p) {
          list.push({ place: p, city });
          break;
        }
      }
    });
    return list;
  }, [savedPlaceIds]);

  return (
    <AppContext.Provider
      value={{
        themeMode,
        resolvedTheme,
        setThemeMode,
        cycleThemeMode,
        savedPlaceIds,
        toggleSavePlace,
        isPlaceSaved,
        savedPlacesWithCity,
        isSavedDrawerOpen,
        setIsSavedDrawerOpen,
        openSavedDrawer: () => setIsSavedDrawerOpen(true),
        closeSavedDrawer: () => setIsSavedDrawerOpen(false),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppContextProvider');
  }
  return context;
}

