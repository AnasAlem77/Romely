"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Sparkles, BookOpen, Bookmark, Home } from "lucide-react";
import { useApp } from "@/components/AppContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { openSavedDrawer, savedPlaceIds } = useApp();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // The member entrance is a self-contained, distraction-free mobile surface.
  // All other routes retain the shared fixed navigation unchanged.
  if (pathname === "/sign-in") return null;

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      name: "Destinations",
      href: "/destinations",
      icon: Compass,
      isActive:
        pathname.startsWith("/destinations") ||
        pathname.startsWith("/city"),
    },
    {
      name: "Sanctuaries",
      href: "/sanctuaries",
      icon: Sparkles,
      isActive:
        pathname.startsWith("/sanctuaries") ||
        pathname.startsWith("/place"),
    },
    {
      name: "Journal",
      href: "/journal",
      icon: BookOpen,
      isActive: pathname.startsWith("/journal"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAF8F5]/95 dark:bg-[#0A0A0C]/95 backdrop-blur-md border-t border-stone-200/80 dark:border-white/10 shadow-lg px-2 py-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex justify-around items-center"
    >
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            prefetch={false}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-colors ${
              item.isActive
                ? "text-[#9A743E] dark:text-[#C5A880] font-semibold"
                : "text-stone-700 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 font-normal"
            }`}
          >
            <Icon
              className={`w-5 h-5 mb-1 transition-transform ${
                item.isActive
                  ? "scale-110 stroke-[2.2]"
                  : "stroke-[1.6]"
              }`}
            />
            <span className="text-[10px] tracking-tight">
              {item.name}
            </span>
          </Link>
        );
      })}

      <Link
        href="/saved"
        prefetch={false}
        className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-colors ${
          pathname === "/saved"
            ? "text-[#9A743E] dark:text-[#C5A880] font-semibold"
            : "text-stone-700 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 font-normal"
        } relative`}
      >
        <div className="relative">
          <Bookmark className="w-5 h-5 mb-1 stroke-[1.6]" />

          {isHydrated && savedPlaceIds.length > 0 && (
            <span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#9A743E] dark:bg-[#C5A880] text-[9px] font-bold text-white dark:text-[#0A0A0C] shadow-sm">
              {savedPlaceIds.length}
            </span>
          )}
        </div>

        <span className="text-[10px] tracking-tight">Saved</span>
      </Link>
    </nav>
  );
}
