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
    <div className="relative -mb-20 min-h-[100svh] overflow-x-hidden bg-[#FAF8F5] text-stone-900 transition-colors duration-200 dark:bg-[#0A0A0C] dark:text-[#EDEBE8] lg:mb-0 lg:min-h-[calc(100vh-5rem)] lg:overflow-hidden">
      {/* Deliberate seam beneath the global navigation */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#C5A880]/40 to-transparent" />

      {/* Ambient gold aura */}
      <div
        aria-hidden="true"
        className="romely-aura pointer-events-none absolute -top-48 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#C5A880]/15 dark:bg-[#C5A880]/20 blur-[150px]"
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-1px)] max-w-7xl flex-col justify-start gap-4 px-6 py-8 sm:px-8 sm:py-10 lg:grid lg:min-h-0 lg:grid-cols-2 lg:gap-16 lg:px-6 lg:py-20">
        {/* Entrance column */}
        <section className="contents lg:flex lg:flex-col lg:gap-6">
          <div className="romely-signin-brand order-1 flex items-center gap-2 text-[10px] font-sans uppercase tracking-[0.2em] text-[#C5A880] lg:order-none lg:text-sm">
            <ArrowLeft className="h-4 w-4" />
            <Link href="/" className="transition-opacity hover:opacity-75 hover:underline">
              Back to ROMELY
            </Link>
          </div>
          <h2 className="romely-signin-copy order-2 font-serif text-[2rem] font-light leading-none text-stone-900 dark:text-white lg:order-none lg:text-3xl">
            Member Sign In
          </h2>
          <p className="romely-signin-copy order-3 max-w-md text-[13px] leading-relaxed text-stone-600 [animation-delay:80ms] dark:text-[#9C9893] lg:order-none lg:text-sm">
            Access your saved itineraries, curators’ field notes, and private dispatches.
          </p>
          <div className="order-5 mt-auto pt-2 lg:order-none lg:mt-0 lg:pt-0">
            <SignInForm />
          </div>
          <div className="order-6 hidden items-center gap-2 text-sm lg:order-none lg:flex">
            <span className="text-[#C5A880]">Not a member yet?</span>
            <Link href="/sign-up" className="underline text-[#C5A880] hover:text-[#D8BB91]">
              Request an invitation
            </Link>
          </div>
        </section>

        {/* Editorial panel */}
        <section className="romely-signin-image order-4 relative h-[clamp(6.5rem,16svh,8.25rem)] overflow-hidden rounded-2xl border border-stone-200 shadow-sm dark:border-white/10 lg:romely-rise lg:order-none lg:min-h-[620px] lg:max-h-none lg:rounded-3xl">
          <Image
            src={FEATURED_IMAGE}
            alt="Haussmann facades along the Seine at golden hour"
            fill
            priority
            className="object-cover opacity-85 dark:opacity-50"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5]/90 via-[#FAF8F5]/40 to-transparent dark:from-[#0A0A0C] dark:via-[#0A0A0C]/80 dark:to-[#0A0A0C]/40" />

          <div className="relative flex h-full min-h-0 flex-col justify-between p-4 sm:p-5 lg:min-h-[620px] lg:p-8">
            <div className="flex flex-col gap-2">
              <span className="font-serif text-lg font-medium tracking-[0.18em] text-stone-900 dark:text-white lg:text-2xl lg:tracking-widest">
                ROMELY
              </span>
              <span className="text-[8px] font-sans uppercase tracking-[0.28em] text-[#C5A880] lg:text-[10px]">
                Curated Guides
              </span>
            </div>

            <div className="hidden space-y-6 lg:block">
              <div className="flex items-center gap-2 text-[10px] font-sans uppercase tracking-[0.24em] text-[#C5A880]">
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
