import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Compass, ShieldCheck, Sparkles } from 'lucide-react';
import { SignInForm } from '@/components/SignInForm';

export const metadata: Metadata = {
  title: 'Member Sign In — ROMELY',
  description:
    'Enter the ROMELY members’ compendium: saved itineraries, curators’ field notes, and private editorial dispatches.',
};

const FEATURED_IMAGE = '/images/hero_paris.jpg';

const MEMBERSHIP_PRIVILEGES = [
  'Saved itineraries that travel with you across devices',
  'Curators’ field notes released ahead of publication',
  'Private dispatches from our city correspondents',
];

export default function SignInPage() {
  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#FAF8F5] dark:bg-[#0A0A0C] text-stone-900 dark:text-[#EDEBE8] transition-colors duration-200">
      {/* Deliberate seam beneath the global navigation */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#C5A880]/40 to-transparent" />

      {/* Ambient gold aura */}
      <div
        aria-hidden="true"
        className="romely-aura pointer-events-none absolute -top-48 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#C5A880]/15 dark:bg-[#C5A880]/20 blur-[150px]"
      />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-2 lg:gap-16 lg:py-20">
        {/* Entrance column */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] font-sans text-[#C5A880]">
            <ArrowLeft className="h-4 w-4" />
            <Link href="/" className="hover:underline">
              Back to ROMELY
            </Link>
          </div>
          <h2 className="font-serif text-3xl font-light text-stone-900 dark:text-white">
            Member Sign In
          </h2>
          <p className="text-sm text-stone-600 dark:text-[#9C9893]">
            Access your saved itineraries, curators’ field notes, and private dispatches.
          </p>
          <SignInForm />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#C5A880]">Not a member yet?</span>
            <Link href="/sign-up" className="underline text-[#C5A880] hover:text-[#D8BB91]">
              Request an invitation
            </Link>
          </div>
        </section>

        {/* Editorial panel */}
        <section className="romely-rise relative min-h-[240px] overflow-hidden rounded-3xl border border-stone-200 dark:border-white/10 lg:min-h-[620px] shadow-sm">
          <Image
            src={FEATURED_IMAGE}
            alt="Haussmann facades along the Seine at golden hour"
            fill
            priority
            className="object-cover opacity-85 dark:opacity-50"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5]/90 via-[#FAF8F5]/40 to-transparent dark:from-[#0A0A0C] dark:via-[#0A0A0C]/80 dark:to-[#0A0A0C]/40" />

          <div className="relative flex h-full min-h-[340px] flex-col justify-between p-8 sm:p-10 lg:min-h-[620px]">
            <div className="flex flex-col gap-2">
              <span className="font-serif text-2xl font-medium tracking-widest text-stone-900 dark:text-white">
                ROMELY
              </span>
              <span className="text-[10px] uppercase tracking-[0.28em] font-sans text-[#C5A880]">
                Curated Guides
              </span>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] font-sans text-[#C5A880]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Members’ Entrance</span>
              </div>

              <h2 className="max-w-md font-serif text-3xl font-light leading-snug text-stone-900 dark:text-white sm:text-4xl">
                A quieter way to keep the places that stay with you.
              </h2>

              <ul className="space-y-2.5">
                {MEMBERSHIP_PRIVILEGES.map((privilege) => (
                  <li
                    key={privilege}
                    className="flex items-start gap-2.5 text-xs leading-relaxed font-sans text-stone-700 dark:text-[#9C9893]"
                  >
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C5A880]" />
                    <span>{privilege}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>



        
      </div>
    </div>
  );
}