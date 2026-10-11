'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';

export default function HeaderWrapper() {
  const pathname = usePathname();
  // Hide the global navigation bar on the sign‑in page
  if (pathname === '/sign-in') return null;
  return <Navbar />;
}

